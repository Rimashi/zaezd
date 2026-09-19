from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field

from app.enums import HorseSex, HorseStatus


class HorseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    breed: str = Field(min_length=1, max_length=150)
    owner: str = Field(min_length=1, max_length=150)
    birth_date: date
    sex: HorseSex
    weight_kg: Decimal | None = Field(default=None, gt=0)
    status: HorseStatus = HorseStatus.ACTIVE


class HorseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    breed: str | None = Field(default=None, min_length=1, max_length=150)
    owner: str | None = Field(default=None, min_length=1, max_length=150)
    birth_date: date | None = None
    sex: HorseSex | None = None
    weight_kg: Decimal | None = Field(default=None, gt=0)
    status: HorseStatus | None = None
