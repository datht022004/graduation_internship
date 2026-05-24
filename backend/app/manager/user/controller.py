from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.user.usecase import ManagedUser, ManagedUserCreate, ManagedUserListResponse, ManagedUserUpdate, user_usecase

router = APIRouter(prefix="/user", tags=["User - Public"])
admin_router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


# Trả dữ liệu public cho tab Trang chủ.
@router.get("/home")
async def get_home():
    return user_usecase.get_home()


# Trả dữ liệu public cho tab Dịch vụ SEO.
@router.get("/seo-service")
async def get_seo_service():
    return user_usecase.get_seo_service()


# Trả dữ liệu public cho tab Thiết kế Website.
@router.get("/web-design")
async def get_web_design():
    return user_usecase.get_web_design()


# Trả dữ liệu public cho tab Quảng cáo.
@router.get("/ads")
async def get_ads():
    return user_usecase.get_ads()


# Trả dữ liệu public cho tab Blog.
@router.get("/blog")
async def get_blog():
    return user_usecase.get_blog()


# Lấy danh sách bản ghi có phân trang/lọc khi cần.
@admin_router.get("", response_model=ManagedUserListResponse)
async def list_users(
    q: str = "",
    role: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    admin: UserInfo = Depends(require_admin),
):
    return user_usecase.list_managed_users(search=q, role=role, page=page, page_size=page_size)


# Tạo bản ghi mới sau khi validate payload.
@admin_router.post("", response_model=ManagedUser, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: ManagedUserCreate,
    admin: UserInfo = Depends(require_admin),
):
    result, user = user_usecase.create_managed_user(body)
    if result == "invalid_email":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email không hợp lệ.")
    if result == "invalid_role":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vai trò không hợp lệ.")
    if result == "exists":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã tồn tại.")
    return user


# Cập nhật bản ghi hiện có theo id/khóa chính.
@admin_router.put("/{email}", response_model=ManagedUser)
async def update_user(
    email: str,
    body: ManagedUserUpdate,
    admin: UserInfo = Depends(require_admin),
):
    result, user = user_usecase.update_managed_user(email, body, admin)
    if result == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
    if result == "invalid_role":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vai trò không hợp lệ.")
    if result == "self_role":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể tự hạ quyền admin của chính bạn.")
    return user


# Xóa bản ghi/tài nguyên theo id/khóa chính.
@admin_router.delete("/{email}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    email: str,
    admin: UserInfo = Depends(require_admin),
):
    result = user_usecase.delete_managed_user(email, admin)
    if result == "self_delete":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể xóa tài khoản đang đăng nhập.")
    if result == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
