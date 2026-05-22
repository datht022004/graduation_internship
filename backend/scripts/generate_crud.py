import os

COLLECTIONS = [
    {
        "name": "service_packages",
        "singular": "service_package",
        "model": "ServicePackageDocument",
        "class_prefix": "ServicePackage",
        "fields": """
    service_type: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    summary: str = ""
    points: list[str] = Field(default_factory=list)
    price_label: str = ""
    is_popular: bool = False
    sort_order: int = 1
    is_active: bool = True
""",
        "update_fields": """
    service_type: str | None = None
    title: str | None = None
    summary: str | None = None
    points: list[str] | None = None
    price_label: str | None = None
    is_popular: bool | None = None
    sort_order: int | None = None
    is_active: bool | None = None
""",
    },
    {
        "name": "case_studies",
        "singular": "case_study",
        "model": "CaseStudyDocument",
        "class_prefix": "CaseStudy",
        "fields": """
    title: str = Field(..., min_length=1)
    client_industry: str = ""
    challenge: str = ""
    solution: str = ""
    results: list[dict[str, str]] = Field(default_factory=list)
    chart_data: list[int] = Field(default_factory=list)
    service_type: str = "seo"
    is_featured: bool = False
    image_url: str = ""
    sort_order: int = 1
""",
        "update_fields": """
    title: str | None = None
    client_industry: str | None = None
    challenge: str | None = None
    solution: str | None = None
    results: list[dict[str, str]] | None = None
    chart_data: list[int] | None = None
    service_type: str | None = None
    is_featured: bool | None = None
    image_url: str | None = None
    sort_order: int | None = None
"""
    },
    {
        "name": "company_profile",
        "singular": "company_profile",
        "model": "CompanyProfileDocument",
        "class_prefix": "CompanyProfile",
        "fields": """
    section_key: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    subtitle: str = ""
    description: str = ""
    color: str = ""
    icon: str = ""
    sort_order: int = 1
    is_active: bool = True
""",
        "update_fields": """
    section_key: str | None = None
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    color: str | None = None
    icon: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None
"""
    },
    {
        "name": "contact_requests",
        "singular": "contact_request",
        "model": "ContactRequestDocument",
        "class_prefix": "ContactRequest",
        "fields": """
    name: str = Field(..., min_length=1)
    email: str = ""
    phone: str = ""
    company: str = ""
    service_interest: str = "general"
    message: str = ""
    source: str = ""
    status: str = "new"
    assigned_to: str = ""
    notes: str = ""
""",
        "update_fields": """
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    service_interest: str | None = None
    message: str | None = None
    source: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    notes: str | None = None
"""
    },
    {
        "name": "testimonials",
        "singular": "testimonial",
        "model": "TestimonialDocument",
        "class_prefix": "Testimonial",
        "fields": """
    client_name: str = Field(..., min_length=1)
    client_position: str = ""
    client_company: str = ""
    client_avatar: str = ""
    content: str = Field(..., min_length=1)
    rating: int = 5
    service_type: str = "seo"
    is_active: bool = True
""",
        "update_fields": """
    client_name: str | None = None
    client_position: str | None = None
    client_company: str | None = None
    client_avatar: str | None = None
    content: str | None = None
    rating: int | None = None
    service_type: str | None = None
    is_active: bool | None = None
"""
    }
]

REPOSITORY_TEMPLATE = """from app.core.database import get_db

COLLECTION_NAME = "{name}"

class {class_prefix}Repository:
    def get_collection(self):
        return get_db()[COLLECTION_NAME]

    def ensure_indexes(self):
        self.get_collection().create_index("id", unique=True)

    def get_all(self) -> list[dict]:
        items = list(self.get_collection().find({{}}))
        return [self._normalize(item) for item in items]

    def get_by_id(self, item_id: str) -> dict | None:
        item = self.get_collection().find_one({{"id": item_id}})
        if not item:
            return None
        return self._normalize(item)

    def create(self, data: dict) -> dict:
        self.get_collection().insert_one(data)
        return self.get_by_id(data["id"])

    def update(self, item_id: str, data: dict) -> dict | None:
        self.get_collection().update_one({{"id": item_id}}, {{"$set": data}})
        return self.get_by_id(item_id)

    def delete(self, item_id: str) -> bool:
        result = self.get_collection().delete_one({{"id": item_id}})
        return result.deleted_count > 0

    def _normalize(self, item: dict) -> dict:
        item["_id"] = str(item["_id"])
        return item

{singular}_repository = {class_prefix}Repository()
"""

USECASE_TEMPLATE = """import uuid
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.manager.{name}.repository import {singular}_repository
from app.models.{name} import {model}

class {class_prefix}Base(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
{fields}

class {class_prefix}Create({class_prefix}Base):
    pass

class {class_prefix}Update(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
{update_fields}

class {class_prefix}({class_prefix}Base):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

class {class_prefix}UseCase:
    def get_all(self) -> list[{class_prefix}]:
        {singular}_repository.ensure_indexes()
        items = {singular}_repository.get_all()
        # Some models don't have updated_at, some do
        for item in items:
            if "updated_at" not in item:
                item["updated_at"] = None
            if "created_at" not in item:
                item["created_at"] = self._now()
        return [{class_prefix}(**item) for item in items]

    def create(self, payload: {class_prefix}Create) -> {class_prefix}:
        {singular}_repository.ensure_indexes()
        now = self._now()
        data = payload.model_dump(exclude_none=True)
        data.update({{"id": str(uuid.uuid4())[:8], "created_at": now, "updated_at": now}})
        doc = {model}(**data)
        created = {singular}_repository.create(doc.model_dump(by_alias=True, exclude_none=True))
        if "updated_at" not in created:
            created["updated_at"] = None
        return {class_prefix}(**created)

    def update(self, item_id: str, payload: {class_prefix}Update) -> {class_prefix} | None:
        {singular}_repository.ensure_indexes()
        existing = {singular}_repository.get_by_id(item_id)
        if not existing:
            return None

        update_data = payload.model_dump(exclude_none=True, exclude_unset=True)
        if update_data:
            update_data["updated_at"] = self._now()
            existing = {singular}_repository.update(item_id, update_data)
        
        if "updated_at" not in existing:
            existing["updated_at"] = None
        if "created_at" not in existing:
            existing["created_at"] = self._now()

        return {class_prefix}(**existing)

    def delete(self, item_id: str) -> bool:
        return {singular}_repository.delete(item_id)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

{singular}_usecase = {class_prefix}UseCase()
"""

CONTROLLER_TEMPLATE = """from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.manager.auth.usecase import UserInfo, require_admin
from app.manager.{name}.usecase import (
    {class_prefix},
    {class_prefix}Create,
    {class_prefix}Update,
    {singular}_usecase,
)

admin_router = APIRouter(prefix="/admin/{name_hyphen}", tags=["Admin - {class_prefix}"])
public_router = APIRouter(prefix="/user/{name_hyphen}", tags=["User - {class_prefix}"])

@public_router.get("", response_model=list[{class_prefix}])
async def get_all_public():
    return {singular}_usecase.get_all()

@admin_router.get("", response_model=list[{class_prefix}])
async def get_all_admin(admin: UserInfo = Depends(require_admin)):
    return {singular}_usecase.get_all()

@admin_router.post("", response_model={class_prefix}, status_code=status.HTTP_201_CREATED)
async def create_item(body: {class_prefix}Create, admin: UserInfo = Depends(require_admin)):
    return {singular}_usecase.create(body)

@admin_router.put("/{{item_id}}", response_model={class_prefix})
async def update_item(item_id: str, body: {class_prefix}Update, admin: UserInfo = Depends(require_admin)):
    item = {singular}_usecase.update(item_id, body)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return item

@admin_router.delete("/{{item_id}}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, admin: UserInfo = Depends(require_admin)):
    deleted = {singular}_usecase.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
"""

INIT_TEMPLATE = """# {class_prefix} module
"""

def generate_all():
    base_dir = "/home/dathoang022004/All_project/VKU/ThucTapTotNghiep/backend/app/manager"
    for col in COLLECTIONS:
        dir_path = os.path.join(base_dir, col["name"])
        os.makedirs(dir_path, exist_ok=True)
        
        name_hyphen = col["name"].replace("_", "-")
        
        with open(os.path.join(dir_path, "repository.py"), "w") as f:
            f.write(REPOSITORY_TEMPLATE.format(**col))
            
        with open(os.path.join(dir_path, "usecase.py"), "w") as f:
            f.write(USECASE_TEMPLATE.format(**col))
            
        with open(os.path.join(dir_path, "controller.py"), "w") as f:
            f.write(CONTROLLER_TEMPLATE.format(**col, name_hyphen=name_hyphen))
            
        with open(os.path.join(dir_path, "__init__.py"), "w") as f:
            f.write(INIT_TEMPLATE.format(**col))
            
if __name__ == "__main__":
    generate_all()
    print("CRUD generated successfully.")
