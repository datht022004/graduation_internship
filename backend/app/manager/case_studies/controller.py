from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.case_studies.usecase import (
    CaseStudy,
    CaseStudyCreate,
    CaseStudyUpdate,
    case_study_usecase,
)

admin_router = APIRouter(prefix="/admin/case-studies", tags=["Admin - CaseStudy"])
public_router = APIRouter(prefix="/user/case-studies", tags=["User - CaseStudy"])

@public_router.get("", response_model=list[CaseStudy])
async def get_all_public():
    return case_study_usecase.get_all()

@admin_router.get("", response_model=list[CaseStudy])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return case_study_usecase.get_all()

@admin_router.post("", response_model=CaseStudy, status_code=status.HTTP_201_CREATED)
async def create_item(body: CaseStudyCreate, admin: UserInfo = Depends(require_admin)):
    return case_study_usecase.create(body)

@admin_router.put("/{item_id}", response_model=CaseStudy)
async def update_item(item_id: str, body: CaseStudyUpdate, admin: UserInfo = Depends(require_admin)):
    item = case_study_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = case_study_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
