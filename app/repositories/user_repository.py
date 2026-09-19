from sqlalchemy import select

from app.models import User


def get_all(db):
    return list(db.scalars(select(User).order_by(User.id)).all())


def get_by_id(db, user_id: int):
    return db.get(User, user_id)


def get_by_login(db, login: str):
    statement = select(User).where(User.login == login)
    return db.scalar(statement)


def create(db, email, login, password_hash, role):
    user = User(email=email, login=login, password_hash=password_hash, role=role)
    db.add(user)
    db.flush()
    return user


def delete(db, user):
    db.delete(user)


def count_admins(db):
    return len([user for user in get_all(db) if user.role.value == "admin"])
