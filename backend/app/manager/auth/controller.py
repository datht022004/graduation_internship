from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from pymongo.errors import PyMongoError

from app.manager.auth.usecase import UserInfo, auth_usecase, get_current_user
from app.helpers.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Payload dang nhap bang email/password."""

    email: str
    password: str
    role: str = "user"


class GoogleLoginRequest(BaseModel):
    """Payload dang nhap bang Google OAuth token."""

    google_token: str
    role: str = "user"


class RegisterRequest(BaseModel):
    """Payload tao tai khoan nguoi dung moi."""

    name: str
    email: str
    password: str


class LoginResponse(BaseModel):
    """Response dang nhap gom access token va thong tin nguoi dung."""

    access_token: str
    token_type: str = "bearer"
    user: UserInfo


# Tạo dữ liệu phụ trợ nội bộ từ input hiện tại.
def _build_login_response(account: dict) -> LoginResponse:
    token = auth_usecase.create_access_token(
        data={
            "email": account["email"],
            "name": account["name"],
            "role": account["role"],
        }
    )

    return LoginResponse(
        access_token=token,
        user=UserInfo(
            email=account["email"],
            name=account["name"],
            role=account["role"],
        ),
    )


# Xử lý request API và gọi usecase tương ứng.
def _database_unavailable() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database is not available. Please start MongoDB and try again.",
    )


# Xử lý đăng nhập bằng email/password.
@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest):
    try:
        account = auth_usecase.authenticate_user(body.email, body.password, body.role)
    except PyMongoError:
        raise _database_unavailable()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials for the selected role.",
        )

    return _build_login_response(account)


# Tạo tài khoản người dùng mới.
@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest):
    email = body.email.strip().lower()
    name = body.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required.",
        )

    if "@" not in email or "." not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email is required.",
        )

    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    try:
        account = auth_usecase.register_manual_user(name, email, body.password)
    except PyMongoError:
        raise _database_unavailable()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    return _build_login_response(account)


# Xử lý request API và gọi usecase tương ứng.
@router.get("/me", response_model=UserInfo)
async def get_me(user: UserInfo = Depends(get_current_user)):
    return user


# Xác thực hoặc tạo tài khoản từ Google token.
@router.post("/google", response_model=LoginResponse)
@limiter.limit("10/minute")
async def google_login(request: Request, body: GoogleLoginRequest):
    try:
        account = auth_usecase.authenticate_google(body.google_token, body.role)
    except PyMongoError:
        raise _database_unavailable()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )

    return _build_login_response(account)
