from fastapi import APIRouter

from app.manager.auth.controller import router as auth_router
from app.manager.blog.controller import router as blog_router
from app.manager.category.controller import router as category_router
from app.manager.chat.controller import router as chat_router
from app.manager.document.controller import router as document_router
from app.manager.user.controller import admin_router as admin_user_router
from app.manager.user.controller import router as user_router
from app.manager.site_content.controller import admin_router as admin_site_content_router
from app.manager.site_content.controller import public_router as site_content_router
from app.manager.service_packages.controller import admin_router as admin_service_packages_router, public_router as service_packages_router
from app.manager.case_studies.controller import admin_router as admin_case_studies_router, public_router as case_studies_router
from app.manager.company_profile.controller import admin_router as admin_company_profile_router, public_router as company_profile_router
from app.manager.contact_requests.controller import admin_router as admin_contact_requests_router, public_router as contact_requests_router
from app.manager.testimonials.controller import admin_router as admin_testimonials_router, public_router as testimonials_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(blog_router)
api_router.include_router(category_router)
api_router.include_router(chat_router)
api_router.include_router(document_router)
api_router.include_router(user_router)
api_router.include_router(admin_user_router)
api_router.include_router(site_content_router)
api_router.include_router(admin_site_content_router)
api_router.include_router(service_packages_router)
api_router.include_router(admin_service_packages_router)
api_router.include_router(case_studies_router)
api_router.include_router(admin_case_studies_router)
api_router.include_router(company_profile_router)
api_router.include_router(admin_company_profile_router)
api_router.include_router(contact_requests_router)
api_router.include_router(admin_contact_requests_router)
api_router.include_router(testimonials_router)
api_router.include_router(admin_testimonials_router)

