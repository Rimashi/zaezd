from sqlalchemy import select

from app.models import Horse, Team


def get_all(db):
    return list(db.scalars(select(Horse).order_by(Horse.id)).all())


def get_by_id(db, horse_id: int):
    return db.get(Horse, horse_id)


def create(db, data: dict):
    horse = Horse(**data)
    db.add(horse)
    db.flush()
    return horse


def has_teams(db, horse_id: int):
    return db.scalar(select(Team.id).where(Team.horse_id == horse_id).limit(1)) is not None


def delete(db, horse):
    db.delete(horse)
