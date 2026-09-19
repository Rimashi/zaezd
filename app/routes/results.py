from fastapi import APIRouter, Request

from app.auth import require_user
from app.controllers import result_controller
from app.schemas.result import ResultCreate, ResultUpdate


router = APIRouter()


@router.get("")
def list_results():
    return result_controller.list_results()


@router.get("/{result_id}")
def get_result(result_id: int):
    return result_controller.get_result(result_id)


@router.post("")
def create_result(data: ResultCreate, request: Request):
    require_user(request)
    return result_controller.create_result(data)


@router.patch("/{result_id}")
def update_result(result_id: int, data: ResultUpdate, request: Request):
    require_user(request)
    return result_controller.update_result(result_id, data)


@router.delete("/{result_id}")
def delete_result(result_id: int, request: Request):
    require_user(request)
    return result_controller.delete_result(result_id)
