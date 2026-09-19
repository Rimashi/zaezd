from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import jockey_controller
from app.schemas.jockey import JockeyCreate, JockeyUpdate


router = APIRouter()


@router.get("")
def list_jockeys():
    return jockey_controller.list_jockeys()


@router.get("/{jockey_id}")
def get_jockey(jockey_id: int):
    return jockey_controller.get_jockey(jockey_id)


@router.post("")
def create_jockey(data: JockeyCreate, request: Request):
    require_user(request)
    return jockey_controller.create_jockey(data)


@router.patch("/{jockey_id}")
def update_jockey(jockey_id: int, data: JockeyUpdate, request: Request):
    require_user(request)
    return jockey_controller.update_jockey(jockey_id, data)


@router.delete("/{jockey_id}")
def delete_jockey(jockey_id: int, request: Request):
    require_user(request)
    return jockey_controller.delete_jockey(jockey_id)
