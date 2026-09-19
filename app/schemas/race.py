from datetime import time

from pydantic import BaseModel, Field

from app.enums import RaceStatus


class RaceCreate(BaseModel):
    competition_id: int = Field(gt=0)
    race_number: int = Field(gt=0)
    start_time: time | None = None
    distance_m: int = Field(gt=0)
    status: RaceStatus = RaceStatus.PLANNED


class RaceUpdate(BaseModel):
    competition_id: int | None = Field(default=None, gt=0)
    race_number: int | None = Field(default=None, gt=0)
    start_time: time | None = None
    distance_m: int | None = Field(default=None, gt=0)
    status: RaceStatus | None = None
