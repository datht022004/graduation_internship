from fastapi import APIRouter

from app.manager.auth.controller import router as auth_router
from app.manager.blog.controller import router as blog_router
from app.manager.category.controller import router as category_router
from app.manager.chat.controller import router as chat_router
from app.manager.document.controller import router as document_router
from app.manager.user.controller import router as user_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(blog_router)
api_router.include_router(category_router)
api_router.include_router(chat_router)
api_router.include_router(document_router)
api_router.include_router(user_router)
