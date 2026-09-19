from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import race_entry_controller
from app.schemas.race_entry import RaceEntryCreate, RaceEntryUpdate


router = APIRouter()


@router.get("")
def list_entries(request: Request, race_id: int | None = None):
    require_user(request)
    return race_entry_controller.list_entries(race_id)


@router.get("/{entry_id}")
def get_entry(entry_id: int, request: Request):
    require_user(request)
    return race_entry_controller.get_entry(entry_id)


@router.post("")
def create_entry(data: RaceEntryCreate, request: Request):
    require_user(request)
    return race_entry_controller.create_entry(data)


@router.patch("/{entry_id}")
def update_entry(entry_id: int, data: RaceEntryUpdate, request: Request):
    require_user(request)
    return race_entry_controller.update_entry(entry_id, data)


@router.delete("/{entry_id}")
def delete_entry(entry_id: int, request: Request):
    require_user(request)
    return race_entry_controller.delete_entry(entry_id)
