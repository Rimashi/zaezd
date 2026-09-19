from pydantic import BaseModel, Field

from app.enums import RaceEntryStatus


class RaceEntryCreate(BaseModel):
    race_id: int = Field(gt=0)
    team_id: int = Field(gt=0)
    start_number: int = Field(gt=0)
    status: RaceEntryStatus = RaceEntryStatus.REGISTERED
    withdrawal_reason: str | None = Field(default=None, max_length=500)


class RaceEntryUpdate(BaseModel):
    race_id: int | None = Field(default=None, gt=0)
    team_id: int | None = Field(default=None, gt=0)
    start_number: int | None = Field(default=None, gt=0)
    status: RaceEntryStatus | None = None
    withdrawal_reason: str | None = Field(default=None, max_length=500)
