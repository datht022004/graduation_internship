from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.manager.auth.interface import UserInfo
from app.manager.auth.usecase import require_admin
from app.manager.user.interface import ManagedUser, ManagedUserCreate, ManagedUserListResponse, ManagedUserUpdate
from app.manager.user.usecase import user_usecase

router = APIRouter(prefix="/user", tags=["User - Public"])
admin_router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("/home")
async def get_home():
    return user_usecase.get_home()


@router.get("/seo-service")
async def get_seo_service():
    return user_usecase.get_seo_service()


@router.get("/web-design")
async def get_web_design():
    return user_usecase.get_web_design()


@router.get("/ads")
async def get_ads():
    return user_usecase.get_ads()


@router.get("/blog")
async def get_blog():
    return user_usecase.get_blog()


@admin_router.get("", response_model=ManagedUserListResponse)
async def list_users(
    q: str = "",
    role: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    admin: UserInfo = Depends(require_admin),
):
    return user_usecase.list_managed_users(search=q, role=role, page=page, page_size=page_size)


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
