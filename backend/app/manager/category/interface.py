from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1)
    description: str = ""


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1)
    description: str | None = None


class Category(CategoryBase):
    id: str
    slug: str
    postCount: int = 0
    created_at: datetime
    updated_at: datetime


class CategoryListResponse(BaseModel):
    items: list[Category]
    total: int
    page: int
    pageSize: int
    totalPages: int
