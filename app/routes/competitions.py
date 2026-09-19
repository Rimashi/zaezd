from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import competition_controller
from app.schemas.competition import CompetitionCreate, CompetitionUpdate


router = APIRouter()


@router.get("")
def list_competitions(request: Request):
    require_user(request)
    return competition_controller.list_competitions()


@router.get("/{competition_id}")
def get_competition(competition_id: int, request: Request):
    require_user(request)
    return competition_controller.get_competition(competition_id)


@router.post("")
def create_competition(data: CompetitionCreate, request: Request):
    current_user = require_user(request)
    return competition_controller.create_competition(data, current_user.id)


@router.patch("/{competition_id}")
def update_competition(competition_id: int, data: CompetitionUpdate, request: Request):
    require_user(request)
    return competition_controller.update_competition(competition_id, data)


@router.delete("/{competition_id}")
def delete_competition(competition_id: int, request: Request):
    require_user(request)
    return competition_controller.delete_competition(competition_id)
