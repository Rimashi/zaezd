from app.database import SessionLocal
from app.services import user_service


def list_users():
    with SessionLocal() as db:
        return user_service.list_users(db)


def get_user(user_id: int):
    with SessionLocal() as db:
        user = user_service.get_user(db, user_id)
        return {
            "id": user.id,
            "email": user.email,
            "login": user.login,
            "role": user.role.value,
        }


def create_user(data):
    with SessionLocal() as db:
        result = user_service.create_user(db, data)
        db.commit()
        return result


def update_user(user_id: int, data):
    with SessionLocal() as db:
        result = user_service.update_user(db, user_id, data)
        db.commit()
        return result


def delete_user(user_id: int, current_user_id: int):
    with SessionLocal() as db:
        result = user_service.delete_user(db, user_id, current_user_id)
        db.commit()
        return result
