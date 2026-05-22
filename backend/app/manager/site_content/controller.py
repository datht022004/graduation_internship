from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.site_content.usecase import (
    SiteContent,
    SiteContentCreate,
    SiteContentUpdate,
    site_content_usecase,
)

admin_router = APIRouter(prefix="/admin/site-content", tags=["Admin - Site Content"])
public_router = APIRouter(prefix="/user/site-content", tags=["User - Site Content"])


@public_router.get("/{page_key}", response_model=list[SiteContent])
async def get_site_content(page_key: str):
    """Lấy nội dung của một trang (FE user)."""
    return site_content_usecase.get_content_by_page(page_key)


@admin_router.get("", response_model=list[SiteContent])
async def get_site_content_admin(
    page_key: str,
    admin: UserInfo = Depends(require_admin),
):
    """Lấy danh sách nội dung CMS của một trang (Admin)."""
    return site_content_usecase.get_content_by_page(page_key)


@admin_router.post("", response_model=SiteContent, status_code=status.HTTP_201_CREATED)
async def create_site_content(
    body: SiteContentCreate,
    admin: UserInfo = Depends(require_admin),
):
    return site_content_usecase.create_content(body, admin.email)


@admin_router.put("/{content_id}", response_model=SiteContent)
async def update_site_content(
    content_id: str,
    body: SiteContentUpdate,
    admin: UserInfo = Depends(require_admin),
):
    content = site_content_usecase.update_content(content_id, body, admin.email)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site content not found with ID: {content_id}",
        )
    return content


@admin_router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site_content(
    content_id: str,
    admin: UserInfo = Depends(require_admin),
):
    deleted = site_content_usecase.delete_content(content_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site content not found with ID: {content_id}",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
