from fastapi import Request, Response

from app.auth import clear_login_cookie, read_session_user_id, set_login_cookie
from app.database import SessionLocal
from app.errors import AppError
from app.services import auth_service


def login(data, response: Response):
    with SessionLocal() as db:
        user = auth_service.login(db, data.login, data.password)
        set_login_cookie(response, user.id)
        return {
            "id": user.id,
            "email": user.email,
            "login": user.login,
            "role": user.role.value,
        }


def logout(response: Response):
    clear_login_cookie(response)
    return {"message": "Вы вышли из системы"}


def me(request: Request):
    user_id = read_session_user_id(request)
    if user_id is None:
        raise AppError("Нужно войти в систему", 401)

    with SessionLocal() as db:
        return auth_service.get_current_user(db, user_id)
