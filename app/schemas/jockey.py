from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field

from app.enums import JockeyStatus


class JockeyCreate(BaseModel):
    last_name: str = Field(min_length=1, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    patronymic: str | None = Field(default=None, max_length=100)
    birth_date: date
    qualification: str | None = Field(default=None, max_length=150)
    weight_kg: Decimal | None = Field(default=None, gt=0)
    status: JockeyStatus = JockeyStatus.ACTIVE


class JockeyUpdate(BaseModel):
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    patronymic: str | None = Field(default=None, max_length=100)
    birth_date: date | None = None
    qualification: str | None = Field(default=None, max_length=150)
    weight_kg: Decimal | None = Field(default=None, gt=0)
    status: JockeyStatus | None = None
