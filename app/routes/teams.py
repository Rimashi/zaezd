from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import team_controller
from app.schemas.team import TeamCreate, TeamUpdate


router = APIRouter()


@router.get("")
def list_teams(horse_id: int | None = None, jockey_id: int | None = None):
    return team_controller.list_teams(horse_id, jockey_id)


@router.get("/{team_id}")
def get_team(team_id: int):
    return team_controller.get_team(team_id)


@router.post("")
def create_team(data: TeamCreate, request: Request):
    require_user(request)
    return team_controller.create_team(data)


@router.patch("/{team_id}")
def update_team(team_id: int, data: TeamUpdate, request: Request):
    require_user(request)
    return team_controller.update_team(team_id, data)


@router.delete("/{team_id}")
def delete_team(team_id: int, request: Request):
    require_user(request)
    return team_controller.delete_team(team_id)
