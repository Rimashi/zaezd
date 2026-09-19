from app.auth import verify_password
from app.errors import AppError
from app.repositories import user_repository
from app.serializers import model_to_dict


def login(db, login: str, password: str):
    user = user_repository.get_by_login(db, login)
    if user is None or not verify_password(password, user.password_hash):
        raise AppError("Неверный логин или пароль", 401)
    return user


def get_current_user(db, user_id: int):
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise AppError("Сессия устарела. Войдите снова", 401)
    return model_to_dict(user)
