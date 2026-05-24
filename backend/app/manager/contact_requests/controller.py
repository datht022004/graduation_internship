from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.contact_requests.usecase import (
    ContactRequest,
    ContactRequestCreate,
    ContactRequestUpdate,
    contact_request_usecase,
)

admin_router = APIRouter(prefix="/admin/contact-requests", tags=["Admin - ContactRequest"])
public_router = APIRouter(prefix="/user/contact-requests", tags=["User - ContactRequest"])

# Lấy toàn bộ bản ghi cho module hiện tại.
@public_router.get("", response_model=list[ContactRequest])
async def get_all_public():
    return contact_request_usecase.get_all()

# Lấy toàn bộ bản ghi cho module hiện tại.
@admin_router.get("", response_model=list[ContactRequest])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return contact_request_usecase.get_all()

# Tạo bản ghi mới sau khi validate payload.
@admin_router.post("", response_model=ContactRequest, status_code=status.HTTP_201_CREATED)
async def create_item(body: ContactRequestCreate, admin: UserInfo = Depends(require_admin)):
    return contact_request_usecase.create(body)

# Cập nhật bản ghi hiện có theo id/khóa chính.
@admin_router.put("/{item_id}", response_model=ContactRequest)
async def update_item(item_id: str, body: ContactRequestUpdate, admin: UserInfo = Depends(require_admin)):
    item = contact_request_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

# Xóa bản ghi/tài nguyên theo id/khóa chính.
@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = contact_request_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
