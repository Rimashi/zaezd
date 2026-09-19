from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import horse_controller
from app.schemas.horse import HorseCreate, HorseUpdate


router = APIRouter()


@router.get("")
def list_horses(request: Request):
    require_user(request)
    return horse_controller.list_horses()


@router.get("/{horse_id}")
def get_horse(horse_id: int, request: Request):
    require_user(request)
    return horse_controller.get_horse(horse_id)


@router.post("")
def create_horse(data: HorseCreate, request: Request):
    require_user(request)
    return horse_controller.create_horse(data)


@router.patch("/{horse_id}")
def update_horse(horse_id: int, data: HorseUpdate, request: Request):
    require_user(request)
    return horse_controller.update_horse(horse_id, data)


@router.delete("/{horse_id}")
def delete_horse(horse_id: int, request: Request):
    require_user(request)
    return horse_controller.delete_horse(horse_id)
