from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    horse_id: int = Field(gt=0)
    jockey_id: int = Field(gt=0)


class TeamUpdate(BaseModel):
    horse_id: int | None = Field(default=None, gt=0)
    jockey_id: int | None = Field(default=None, gt=0)
