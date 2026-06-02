from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.service_packages.usecase import (
    ServicePackage,
    ServicePackageCreate,
    ServicePackageUpdate,
    service_package_usecase,
)

admin_router = APIRouter(prefix="/admin/service-packages", tags=["Admin - ServicePackage"])

# Lấy toàn bộ bản ghi cho module hiện tại.
@admin_router.get("", response_model=list[ServicePackage])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return service_package_usecase.get_all()

# Tạo bản ghi mới sau khi validate payload.
@admin_router.post("", response_model=ServicePackage, status_code=status.HTTP_201_CREATED)
async def create_item(body: ServicePackageCreate, admin: UserInfo = Depends(require_admin)):
    return service_package_usecase.create(body)

# Cập nhật bản ghi hiện có theo id/khóa chính.
@admin_router.put("/{item_id}", response_model=ServicePackage)
async def update_item(item_id: str, body: ServicePackageUpdate, admin: UserInfo = Depends(require_admin)):
    item = service_package_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

# Xóa bản ghi/tài nguyên theo id/khóa chính.
@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = service_package_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
