from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.manager.auth.interface import UserInfo
from app.manager.auth.usecase import require_admin
from app.manager.category.interface import Category, CategoryCreate, CategoryListResponse, CategoryUpdate
from app.manager.category.usecase import category_usecase

router = APIRouter(prefix="/admin/categories", tags=["Admin - Categories"])


@router.get("", response_model=CategoryListResponse)
async def list_categories(
    name: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    admin: UserInfo = Depends(require_admin),
):
    return category_usecase.list_categories(name=name, page=page, page_size=page_size)


@router.post("", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    admin: UserInfo = Depends(require_admin),
):
    return category_usecase.create_category(body)


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    body: CategoryUpdate,
    admin: UserInfo = Depends(require_admin),
):
    category = category_usecase.update_category(category_id, body)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category not found with ID: {category_id}",
        )
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    admin: UserInfo = Depends(require_admin),
):
    result = category_usecase.delete_category(category_id)
    if result == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category not found with ID: {category_id}",
        )
    if result == "in_use":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category is being used by blog posts.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
