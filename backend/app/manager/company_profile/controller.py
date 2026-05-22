from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.company_profile.usecase import (
    CompanyProfile,
    CompanyProfileCreate,
    CompanyProfileUpdate,
    company_profile_usecase,
)

admin_router = APIRouter(prefix="/admin/company-profile", tags=["Admin - CompanyProfile"])
public_router = APIRouter(prefix="/user/company-profile", tags=["User - CompanyProfile"])

@public_router.get("", response_model=list[CompanyProfile])
async def get_all_public():
    return company_profile_usecase.get_all()

@admin_router.get("", response_model=list[CompanyProfile])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return company_profile_usecase.get_all()

@admin_router.post("", response_model=CompanyProfile, status_code=status.HTTP_201_CREATED)
async def create_item(body: CompanyProfileCreate, admin: UserInfo = Depends(require_admin)):
    return company_profile_usecase.create(body)

@admin_router.put("/{item_id}", response_model=CompanyProfile)
async def update_item(item_id: str, body: CompanyProfileUpdate, admin: UserInfo = Depends(require_admin)):
    item = company_profile_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = company_profile_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
