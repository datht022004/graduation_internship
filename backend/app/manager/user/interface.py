from pydantic import BaseModel, ConfigDict, Field


class ManagedUser(BaseModel):
    id: str
    email: str
    name: str
    role: str
    authProviders: list[str] = []
    createdAt: str = ""


class ManagedUserListResponse(BaseModel):
    items: list[ManagedUser]
    total: int
    page: int
    pageSize: int
    totalPages: int


class ManagedUserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    role: str = "user"


class ManagedUserUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1)
    password: str | None = Field(default=None, min_length=6)
    role: str | None = None
