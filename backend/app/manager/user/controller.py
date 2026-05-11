from fastapi import APIRouter

from app.manager.user.usecase import user_usecase

router = APIRouter(prefix="/user", tags=["User - Public"])


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
