import base64
import hashlib
import hmac
import os

from fastapi import Request, Response

from app.config import SESSION_SECRET
from app.errors import AppError
from app.enums import UserRole


COOKIE_NAME = "horse_racing_session"
PASSWORD_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )

    salt_text = base64.urlsafe_b64encode(salt).decode("ascii")
    digest_text = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt_text}${digest_text}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt_text, digest_text = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False

        iterations = int(iterations_text)
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_text.encode("ascii"))

        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def make_session_value(user_id: int) -> str:
    message = str(user_id)
    signature = hmac.new(
        SESSION_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{message}.{signature}"


def read_session_user_id(request: Request) -> int | None:
    raw = request.cookies.get(COOKIE_NAME)
    if not raw or "." not in raw:
        return None

    user_id_text, signature = raw.split(".", 1)
    expected = hmac.new(
        SESSION_SECRET.encode("utf-8"),
        user_id_text.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return None

    try:
        return int(user_id_text)
    except ValueError:
        return None


def set_login_cookie(response: Response, user_id: int):
    response.set_cookie(
        COOKIE_NAME,
        make_session_value(user_id),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )


def clear_login_cookie(response: Response):
    response.delete_cookie(COOKIE_NAME)


def require_user(request: Request):
    from app.repositories import user_repository
    from app.database import SessionLocal

    user_id = read_session_user_id(request)
    if user_id is None:
        raise AppError("Нужно войти в систему", status_code=401)

    with SessionLocal() as db:
        user = user_repository.get_by_id(db, user_id)
        if user is None:
            raise AppError("Сессия устарела. Войдите снова", status_code=401)
        return user


def require_admin(request: Request):
    user = require_user(request)
    if user.role != UserRole.ADMIN:
        raise AppError("Эта операция доступна только администратору", status_code=403)
    return user
