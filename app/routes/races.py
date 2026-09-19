from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import race_controller
from app.schemas.race import RaceCreate, RaceUpdate


router = APIRouter()


@router.get("")
def list_races(request: Request, competition_id: int | None = None):
    require_user(request)
    return race_controller.list_races(competition_id)


@router.get("/{race_id}")
def get_race(race_id: int, request: Request):
    require_user(request)
    return race_controller.get_race(race_id)


@router.post("")
def create_race(data: RaceCreate, request: Request):
    require_user(request)
    return race_controller.create_race(data)


@router.patch("/{race_id}")
def update_race(race_id: int, data: RaceUpdate, request: Request):
    require_user(request)
    return race_controller.update_race(race_id, data)


@router.delete("/{race_id}")
def delete_race(race_id: int, request: Request):
    require_user(request)
    return race_controller.delete_race(race_id)
