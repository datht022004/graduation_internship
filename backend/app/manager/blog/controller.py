from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.manager.auth.interface import UserInfo
from app.manager.auth.usecase import require_admin
from app.manager.blog.interface import BlogPost, BlogPostCreate, BlogPostListResponse, BlogPostUpdate
from app.manager.blog.usecase import blog_usecase

router = APIRouter(prefix="/admin/blog", tags=["Admin - Blog"])


@router.get("/posts", response_model=BlogPostListResponse)
async def list_blog_posts(
    category: str = "",
    q: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    admin: UserInfo = Depends(require_admin),
):
    return blog_usecase.list_posts(category=category, search=q, page=page, page_size=page_size)


@router.post("/posts", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    body: BlogPostCreate,
    admin: UserInfo = Depends(require_admin),
):
    return blog_usecase.create_post(body)


@router.put("/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(
    post_id: str,
    body: BlogPostUpdate,
    admin: UserInfo = Depends(require_admin),
):
    post = blog_usecase.update_post(post_id, body)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post not found with ID: {post_id}",
        )
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: str,
    admin: UserInfo = Depends(require_admin),
):
    if not blog_usecase.delete_post(post_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post not found with ID: {post_id}",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/posts/{post_id}/toggle-featured", response_model=BlogPost)
async def toggle_featured_blog_post(
    post_id: str,
    admin: UserInfo = Depends(require_admin),
):
    post = blog_usecase.toggle_featured(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post not found with ID: {post_id}",
        )
    return post
