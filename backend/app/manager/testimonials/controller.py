from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.testimonials.usecase import (
    Testimonial,
    TestimonialCreate,
    TestimonialUpdate,
    testimonial_usecase,
)

admin_router = APIRouter(prefix="/admin/testimonials", tags=["Admin - Testimonial"])
public_router = APIRouter(prefix="/user/testimonials", tags=["User - Testimonial"])

# Lấy toàn bộ bản ghi cho module hiện tại.
@public_router.get("", response_model=list[Testimonial])
async def get_all_public():
    return testimonial_usecase.get_all()

# Lấy toàn bộ bản ghi cho module hiện tại.
@admin_router.get("", response_model=list[Testimonial])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return testimonial_usecase.get_all()

# Tạo bản ghi mới sau khi validate payload.
@admin_router.post("", response_model=Testimonial, status_code=status.HTTP_201_CREATED)
async def create_item(body: TestimonialCreate, admin: UserInfo = Depends(require_admin)):
    return testimonial_usecase.create(body)

# Cập nhật bản ghi hiện có theo id/khóa chính.
@admin_router.put("/{item_id}", response_model=Testimonial)
async def update_item(item_id: str, body: TestimonialUpdate, admin: UserInfo = Depends(require_admin)):
    item = testimonial_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

# Xóa bản ghi/tài nguyên theo id/khóa chính.
@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = testimonial_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
