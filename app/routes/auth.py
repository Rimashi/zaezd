from fastapi import APIRouter, Request, Response

from app.controllers import auth_controller
from app.schemas.auth import LoginData


router = APIRouter()


@router.post("/login")
def login(data: LoginData, response: Response):
    return auth_controller.login(data, response)


@router.post("/logout")
def logout(response: Response):
    return auth_controller.logout(response)


@router.get("/me")
def me(request: Request):
    return auth_controller.me(request)
