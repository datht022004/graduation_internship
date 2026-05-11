from pydantic import BaseModel, ConfigDict, Field


class BlogPostBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    readTime: str = Field(..., min_length=1)
    excerpt: str = Field(..., min_length=1)
    content: str = ""
    imageUrl: str = ""
    author: str = ""
    tags: str = ""
    isFeatured: bool = False


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    readTime: str | None = Field(default=None, min_length=1)
    excerpt: str | None = Field(default=None, min_length=1)
    content: str | None = None
    imageUrl: str | None = None
    author: str | None = None
    tags: str | None = None
    isFeatured: bool | None = None


class BlogPost(BlogPostBase):
    id: str
    createdAt: str
    updatedAt: str
