from sqlalchemy import select

from app.models import Jockey, Team


def get_all(db):
    return list(db.scalars(select(Jockey).order_by(Jockey.id)).all())


def get_by_id(db, jockey_id: int):
    return db.get(Jockey, jockey_id)


def create(db, data: dict):
    jockey = Jockey(**data)
    db.add(jockey)
    db.flush()
    return jockey


def has_teams(db, jockey_id: int):
    return db.scalar(select(Team.id).where(Team.jockey_id == jockey_id).limit(1)) is not None


def delete(db, jockey):
    db.delete(jockey)
