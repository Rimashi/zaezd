from sqlalchemy import text

from app.database import SessionLocal
from app.errors import AppError


def health():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "ok"}
    except Exception:
        raise AppError("Приложение работает, но база данных недоступна", 503)
