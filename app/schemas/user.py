from pydantic import BaseModel, Field

from app.enums import UserRole


class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=100)
    login: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.ORGANIZER


class UserUpdate(BaseModel):
    email: str | None = Field(default=None, min_length=3, max_length=100)
    login: str | None = Field(default=None, min_length=3, max_length=100)
    password: str | None = Field(default=None, min_length=6, max_length=128)
    role: UserRole | None = None
