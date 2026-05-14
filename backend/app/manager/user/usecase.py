from datetime import datetime, timezone
from math import ceil

from app.helpers.security import hash_password
from app.manager.auth.interface import UserInfo
from app.manager.user.interface import ManagedUser, ManagedUserCreate, ManagedUserListResponse, ManagedUserUpdate
from app.manager.user.repository import user_repository
from app.models import UserDocument


VALID_ROLES = {"admin", "user"}


class UserUseCase:
    def get_home(self):
        return {
            "serviceCards": [],
            "painPoints": [],
            "strengths": [],
        }

    def get_seo_service(self):
        return {
            "metrics": [],
            "packages": [],
            "roadmap": [],
        }

    def get_web_design(self):
        return {
            "phases": [],
            "highlights": [],
        }

    def get_ads(self):
        return {
            "metrics": [],
            "channels": [],
        }

    def get_blog(self):
        from app.manager.blog.usecase import blog_usecase

        return blog_usecase.get_public_posts()

    def list_managed_users(self, search: str = "", role: str = "", page: int = 1, page_size: int = 10) -> ManagedUserListResponse:
        user_repository.ensure_indexes()
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        role = role.strip().lower()
        if role and role not in VALID_ROLES:
            role = ""

        total = user_repository.count_matching_users(search=search, role=role)
        total_pages = ceil(total / page_size) if total else 1
        safe_page = min(page, total_pages)
        skip = (safe_page - 1) * page_size
        users = user_repository.list_users(search=search, role=role, skip=skip, limit=page_size)

        return ManagedUserListResponse(
            items=[self._to_managed_user(user) for user in users],
            total=total,
            page=safe_page,
            pageSize=page_size,
            totalPages=total_pages,
        )

    def create_managed_user(self, payload: ManagedUserCreate) -> tuple[str, ManagedUser | None]:
        user_repository.ensure_indexes()
        email = payload.email.strip().lower()
        role = payload.role.strip().lower()

        if not self._is_valid_email(email):
            return "invalid_email", None
        if role not in VALID_ROLES:
            return "invalid_role", None
        if user_repository.get_user_by_email(email):
            return "exists", None

        user_doc = UserDocument(
            email=email,
            name=payload.name.strip(),
            role=role,
            password=hash_password(payload.password),
            auth_providers=["password"],
            created_at=datetime.now(timezone.utc),
        )
        user = user_repository.create_user(user_doc.model_dump(by_alias=True, exclude_none=True))
        return "created", self._to_managed_user(user)

    def update_managed_user(self, email: str, payload: ManagedUserUpdate, current_admin: UserInfo) -> tuple[str, ManagedUser | None]:
        user_repository.ensure_indexes()
        existing = user_repository.get_user_by_email(email)
        if not existing:
            return "not_found", None

        update_data = {}
        if payload.name is not None:
            update_data["name"] = payload.name.strip()

        if payload.role is not None:
            role = payload.role.strip().lower()
            if role not in VALID_ROLES:
                return "invalid_role", None
            if existing["email"] == current_admin.email.strip().lower() and role != "admin":
                return "self_role", None
            update_data["role"] = role

        if payload.password:
            update_data["password"] = hash_password(payload.password)

        if update_data:
            existing = user_repository.update_user(email, update_data)
            if payload.password:
                user_repository.add_auth_provider(email, "password")
                existing = user_repository.get_user_by_email(email)

        return "updated", self._to_managed_user(existing)

    def delete_managed_user(self, email: str, current_admin: UserInfo) -> str:
        user_repository.ensure_indexes()
        normalized_email = email.strip().lower()
        if normalized_email == current_admin.email.strip().lower():
            return "self_delete"
        if not user_repository.get_user_by_email(normalized_email):
            return "not_found"
        return "deleted" if user_repository.delete_user(normalized_email) else "not_found"

    def _to_managed_user(self, user: dict) -> ManagedUser:
        created_at = user.get("created_at", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()

        return ManagedUser(
            id=user.get("email", ""),
            email=user.get("email", ""),
            name=self._display_name(user.get("name", "")),
            role=user.get("role", "user"),
            authProviders=user.get("auth_providers", []),
            createdAt=str(created_at or ""),
        )

    def _is_valid_email(self, email: str) -> bool:
        return "@" in email and "." in email.rsplit("@", 1)[-1]

    def _display_name(self, name: str) -> str:
        translations = {
            "System Administrator": "Quản trị viên hệ thống",
            "Enterprise Client": "Khách hàng doanh nghiệp",
        }
        return translations.get(name, name)


user_usecase = UserUseCase()
