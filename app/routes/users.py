from fastapi import APIRouter, Request

from app.auth import require_admin
from app.controllers import user_controller
from app.schemas.user import UserCreate, UserUpdate


router = APIRouter()


@router.get("")
def list_users(request: Request):
    require_admin(request)
    return user_controller.list_users()


@router.get("/{user_id}")
def get_user(user_id: int, request: Request):
    require_admin(request)
    return user_controller.get_user(user_id)


@router.post("")
def create_user(data: UserCreate, request: Request):
    require_admin(request)
    return user_controller.create_user(data)


@router.patch("/{user_id}")
def update_user(user_id: int, data: UserUpdate, request: Request):
    require_admin(request)
    return user_controller.update_user(user_id, data)


@router.delete("/{user_id}")
def delete_user(user_id: int, request: Request):
    current_user = require_admin(request)
    return user_controller.delete_user(user_id, current_user.id)
