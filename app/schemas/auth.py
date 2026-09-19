from pydantic import BaseModel, Field


class LoginData(BaseModel):
    login: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=128)
