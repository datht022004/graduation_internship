# Module Auth — Xác thực người dùng

> Đường dẫn: `app/manager/auth/`

---

## 1. Cấu trúc 4 file

```
app/manager/auth/
├── controller.py    # Khai báo 4 endpoints: login, register, google, me
├── interface.py     # Pydantic schemas: LoginRequest, RegisterRequest, ...
├── repository.py    # Truy cập MongoDB collection "users"
└── usecase.py       # Business logic: authenticate, JWT, Google OAuth
```

---

## 2. interface.py — Định nghĩa Request/Response

File này chứa tất cả Pydantic schemas (DTO) cho module auth.

```python
# ── Request schemas ──

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "user"        # "user" hoặc "admin"

class GoogleLoginRequest(BaseModel):
    google_token: str         # Token từ Google OAuth FE
    role: str = "user"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# ── Response schemas ──

class UserInfo(BaseModel):
    email: str
    name: str
    role: str                 # "user" hoặc "admin"

class LoginResponse(BaseModel):
    access_token: str         # JWT token
    token_type: str = "bearer"
    user: UserInfo
```

**Nguyên lý**: Interface là "hợp đồng" giữa FE và BE. Controller dùng schemas này để tự động validate request body và serialize response.

---

## 3. repository.py — Tầng truy cập Database

Repository chỉ làm 1 việc: **đọc/ghi MongoDB collection `users`**.

### Singleton

```python
auth_repository = AuthRepository()   # Tạo 1 instance duy nhất, dùng xuyên suốt app
```

### Các phương thức CRUD

```python
class AuthRepository:

    # ── Kết nối ──
    def get_collection(self):
        return get_db()["users"]     # Lấy collection "users" từ App MongoDB

    # ── Index ──
    def ensure_indexes(self):
        self.get_collection().create_index("email", unique=True)

    # ── READ: Tìm user theo email ──
    def get_account_by_email(self, email: str) -> Optional[dict]:
        user = self.get_collection().find_one({"email": email.strip().lower()})
        if user:
            user["_id"] = str(user["_id"])   # ObjectId → string
        return user

    # ── READ: Tìm user theo role ──
    def get_account_by_role(self, role: str) -> Optional[dict]:
        user = self.get_collection().find_one({"role": role})
        if user:
            user["_id"] = str(user["_id"])
        return user

    # ── CREATE: Tạo tài khoản mới ──
    def create_account(self, user_data: dict) -> str:
        if "email" in user_data:
            user_data["email"] = user_data["email"].strip().lower()  # normalize
        result = self.get_collection().insert_one(user_data)
        return str(result.inserted_id)

    # ── UPDATE: Gắn Google identity vào account đã có ──
    def attach_google_identity(self, email: str, google_id: str):
        self.get_collection().update_one(
            {"email": email.strip().lower()},
            {
                "$set": {"google_id": google_id},
                "$addToSet": {"auth_providers": "google"},  # Thêm "google" vào array
            },
        )

    # ── UPSERT: Tìm hoặc tạo Google account ──
    def get_or_create_google_account(self, email, name, role, google_id) -> dict:
        account = self.get_account_by_email(email)
        if account:
            # Đã có account → link Google nếu chưa
            if not account.get("google_id"):
                self.attach_google_identity(email, google_id)
            return account

        # Chưa có → tạo mới
        user_data = {
            "email": email, "name": name, "role": role,
            "password": None, "google_id": google_id,
            "auth_providers": ["google"],
            "created_at": datetime.now(timezone.utc),
        }
        user_doc = UserDocument(**user_data)
        self.create_account(user_doc.model_dump(by_alias=True, exclude_none=True))
        return self.get_account_by_email(email)
```

**Nguyên lý**: Repository KHÔNG biết về HTTP, JWT, hay business rule. Nó chỉ làm việc với MongoDB.

---

## 4. usecase.py — Tầng Business Logic

Usecase điều phối giữa repository, security helpers và JWT.

### Singleton

```python
auth_usecase = AuthUseCase()
```

### Các phương thức chính

```python
class AuthUseCase:

    # ── Seed default users khi app start ──
    def init_default_users(self):
        auth_repository.ensure_indexes()
        # Tạo admin nếu chưa có
        if not auth_repository.get_account_by_email(settings.ADMIN_EMAIL):
            auth_repository.create_account(
                UserDocument(
                    email=settings.ADMIN_EMAIL,
                    password=hash_password(settings.ADMIN_PASSWORD),  # bcrypt
                    name="System Administrator",
                    role="admin",
                    auth_providers=["password"],
                    created_at=datetime.now(timezone.utc),
                ).model_dump(by_alias=True, exclude_none=True)
            )
        # Tương tự cho user...

    # ── Đăng ký thủ công ──
    def register_manual_user(self, name, email, password) -> Optional[dict]:
        # 1. Kiểm tra email đã tồn tại chưa
        if auth_repository.get_account_by_email(email):
            return None   # → controller sẽ trả 409 Conflict

        # 2. Hash password + tạo account
        auth_repository.create_account(
            UserDocument(
                email=email,
                password=hash_password(password),  # bcrypt hash
                name=name, role="user",
                auth_providers=["password"],
                created_at=datetime.now(timezone.utc),
            ).model_dump(by_alias=True, exclude_none=True)
        )

        # 3. Trả account vừa tạo
        return auth_repository.get_account_by_email(email)

    # ── Xác thực đăng nhập ──
    def authenticate_user(self, email, password, role) -> Optional[dict]:
        account = auth_repository.get_account_by_email(email)
        if not account:
            return None
        # Verify bcrypt hash + kiểm tra role
        if verify_password(password, account["password"]) and account["role"] == role:
            return account
        return None

    # ── Xác thực Google OAuth ──
    def authenticate_google(self, token, role) -> Optional[dict]:
        # 1. Verify Google id_token
        idinfo = id_token.verify_oauth2_token(token, ..., GOOGLE_CLIENT_ID)
        # 2. Lấy email, name, google_id từ token
        # 3. Logic phân nhánh:
        #    - Admin: chỉ cho login nếu email đã là admin trong DB
        #    - User: tự tạo account nếu chưa có
        ...

    # ── JWT ──
    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        to_encode["exp"] = datetime.now(UTC) + timedelta(minutes=480)
        return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

    def decode_token(self, token: str) -> dict:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

### Auth Dependencies (FastAPI Depends)

```python
# Bất kỳ route nào cần user đăng nhập:
async def get_current_user(credentials = Depends(HTTPBearer())) -> UserInfo:
    payload = auth_usecase.decode_token(credentials.credentials)
    return UserInfo(email=payload["email"], name=payload["name"], role=payload["role"])

# Bất kỳ route nào cần admin:
async def require_admin(user = Depends(get_current_user)) -> UserInfo:
    if user.role != "admin":
        raise HTTPException(403, "Access denied. Admin privileges required.")
    return user
```

**Nguyên lý**: Usecase chứa TẤT CẢ business logic. Nó gọi repository để đọc/ghi DB, gọi security helper để hash password, và tự xử lý JWT.

---

## 5. controller.py — Tầng HTTP

Controller chỉ làm 3 việc: **nhận request → gọi usecase → trả response**.

```python
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── POST /api/auth/login ──
@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest):
    account = auth_usecase.authenticate_user(body.email, body.password, body.role)
    if not account:
        raise HTTPException(401, "Invalid credentials for the selected role.")
    return _build_login_response(account)   # Tạo JWT + trả response

# ── POST /api/auth/register ──
@router.post("/register", response_model=LoginResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest):
    # Validate input
    if not body.name.strip():
        raise HTTPException(400, "Name is required.")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")

    account = auth_usecase.register_manual_user(body.name, body.email, body.password)
    if not account:
        raise HTTPException(409, "Email is already registered.")
    return _build_login_response(account)

# ── GET /api/auth/me ──
@router.get("/me", response_model=UserInfo)
async def get_me(user: UserInfo = Depends(get_current_user)):
    return user    # Đơn giản: decode JWT → trả UserInfo

# ── POST /api/auth/google ──
@router.post("/google", response_model=LoginResponse)
@limiter.limit("10/minute")
async def google_login(request: Request, body: GoogleLoginRequest):
    account = auth_usecase.authenticate_google(body.google_token, body.role)
    if not account:
        raise HTTPException(401, "Invalid Google token.")
    return _build_login_response(account)

# ── Helper: Tạo JWT + LoginResponse ──
def _build_login_response(account: dict) -> LoginResponse:
    token = auth_usecase.create_access_token(
        data={"email": account["email"], "name": account["name"], "role": account["role"]}
    )
    return LoginResponse(
        access_token=token,
        user=UserInfo(email=account["email"], name=account["name"], role=account["role"]),
    )
```

**Nguyên lý**: Controller KHÔNG chứa business logic. Nó chỉ validate input cơ bản (format), gọi usecase, và format HTTP response/error.

---

## 6. Ví dụ CRUD hoàn chỉnh — Đăng ký tài khoản

### Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "matkhau123"
}
```

### Luồng xử lý

```
1. FastAPI parse body → RegisterRequest (Pydantic validate)
2. controller.register()
   ├── Validate: name không rỗng, email có @, password >= 6 ký tự
   └── Gọi auth_usecase.register_manual_user("Nguyễn Văn A", "nguyenvana@gmail.com", "matkhau123")

3. usecase.register_manual_user()
   ├── Normalize email: "nguyenvana@gmail.com"
   ├── auth_repository.get_account_by_email("nguyenvana@gmail.com")
   │   └── MongoDB: db.users.find_one({"email": "nguyenvana@gmail.com"}) → None
   ├── hash_password("matkhau123") → "$2b$12$x9Kj..."
   ├── Tạo UserDocument(email, password=hash, name, role="user", ...)
   ├── auth_repository.create_account(user_doc.model_dump())
   │   └── MongoDB: db.users.insert_one({...})
   └── return auth_repository.get_account_by_email("nguyenvana@gmail.com")

4. controller._build_login_response(account)
   ├── auth_usecase.create_access_token({email, name, role})
   │   └── jwt.encode({email, name, role, exp}, SECRET_KEY, HS256)
   └── return LoginResponse(access_token="eyJ...", user={...})
```

### Response 201

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "nguyenvana@gmail.com",
    "name": "Nguyễn Văn A",
    "role": "user"
  }
}
```

### Dữ liệu MongoDB sau khi tạo

```json
// Collection: users
{
  "_id": "ObjectId(6654...)",
  "email": "nguyenvana@gmail.com",
  "password": "$2b$12$x9KjRn...",
  "name": "Nguyễn Văn A",
  "role": "user",
  "auth_providers": ["password"],
  "created_at": "2026-05-09T01:00:00Z"
}
```

---

## 7. Ví dụ CRUD — Đăng nhập

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@gmail.com",
  "password": "matkhau123",
  "role": "user"
}
```

### Luồng xử lý

```
1. controller.login() → auth_usecase.authenticate_user(email, password, role)

2. usecase.authenticate_user()
   ├── auth_repository.get_account_by_email("nguyenvana@gmail.com")
   │   └── MongoDB: find_one → {email, password: "$2b$12$...", role: "user", ...}
   ├── verify_password("matkhau123", "$2b$12$...") → True
   ├── account["role"] == "user" → True
   └── return account

3. controller._build_login_response(account) → JWT + LoginResponse
```

### Response 200

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "email": "nguyenvana@gmail.com",
    "name": "Nguyễn Văn A",
    "role": "user"
  }
}
```
