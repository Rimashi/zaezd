from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field

from app.enums import CompetitionStatus


class CompetitionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    organizer_id: int | None = None
    competition_date: date
    hippodrome_name: str = Field(min_length=1, max_length=200)
    race_type: str | None = Field(default=None, max_length=100)
    surface_type: str | None = Field(default=None, max_length=100)
    prize_fund: Decimal | None = Field(default=None, ge=0)
    status: CompetitionStatus = CompetitionStatus.PLANNED


class CompetitionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    organizer_id: int | None = None
    competition_date: date | None = None
    hippodrome_name: str | None = Field(default=None, min_length=1, max_length=200)
    race_type: str | None = Field(default=None, max_length=100)
    surface_type: str | None = Field(default=None, max_length=100)
    prize_fund: Decimal | None = Field(default=None, ge=0)
    status: CompetitionStatus | None = None
