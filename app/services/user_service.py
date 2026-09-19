from sqlalchemy.exc import IntegrityError

from app.auth import hash_password
from app.config import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_LOGIN, DEFAULT_ADMIN_PASSWORD
from app.enums import UserRole
from app.errors import AppError
from app.repositories import user_repository
from app.serializers import model_to_dict, models_to_dict


def list_users(db):
    return models_to_dict(user_repository.get_all(db))


def get_user(db, user_id: int):
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise AppError("Пользователь не найден", 404)
    return user


def create_user(db, data):
    if user_repository.get_by_login(db, data.login) is not None:
        raise AppError("Пользователь с таким логином уже существует", 409, {"login": "Логин уже занят"})

    user = user_repository.create(
        db,
        email=data.email,
        login=data.login,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    return model_to_dict(user)


def update_user(db, user_id: int, data):
    user = get_user(db, user_id)
    values = data.model_dump(exclude_unset=True)

    if "login" in values and values["login"] != user.login:
        if user_repository.get_by_login(db, values["login"]) is not None:
            raise AppError("Пользователь с таким логином уже существует", 409, {"login": "Логин уже занят"})

    if "role" in values and user.role == UserRole.ADMIN and values["role"] != UserRole.ADMIN:
        if user_repository.count_admins(db) <= 1:
            raise AppError("Нельзя изменить роль последнего администратора", 409)

    if "password" in values:
        password = values.pop("password")
        if password:
            user.password_hash = hash_password(password)

    for key, value in values.items():
        if key != "password":
            setattr(user, key, value)

    db.flush()
    return model_to_dict(user)


def delete_user(db, user_id: int, current_user_id: int):
    user = get_user(db, user_id)

    if user.id == current_user_id:
        raise AppError("Нельзя удалить пользователя, под которым вы сейчас вошли", 409)

    if user.role == UserRole.ADMIN and user_repository.count_admins(db) <= 1:
        raise AppError("Нельзя удалить последнего администратора", 409)

    if user.competitions:
        raise AppError("Нельзя удалить пользователя: он указан организатором соревнования", 409)

    user_repository.delete(db, user)
    return {"messages": []}


def ensure_default_admin(db):
    existing = user_repository.get_by_login(db, DEFAULT_ADMIN_LOGIN)
    if existing is not None:
        return existing

    admin = user_repository.create(
        db,
        email=DEFAULT_ADMIN_EMAIL,
        login=DEFAULT_ADMIN_LOGIN,
        password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
        role=UserRole.ADMIN,
    )
    db.commit()
    return admin
