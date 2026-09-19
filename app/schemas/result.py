from pydantic import BaseModel, Field

from app.enums import ResultStatus


class ResultCreate(BaseModel):
    race_entry_id: int = Field(gt=0)
    position: int | None = Field(default=None, gt=0)
    finish_time_ms: int | None = Field(default=None, gt=0)
    status: ResultStatus


class ResultUpdate(BaseModel):
    race_entry_id: int | None = Field(default=None, gt=0)
    position: int | None = Field(default=None, gt=0)
    finish_time_ms: int | None = Field(default=None, gt=0)
    status: ResultStatus | None = None
