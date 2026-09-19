from sqlalchemy import select

from app.models import Race, RaceEntry


def get_all(db, competition_id=None):
    statement = select(Race).order_by(Race.competition_id, Race.race_number)
    if competition_id is not None:
        statement = statement.where(Race.competition_id == competition_id)
    return list(db.scalars(statement).all())


def get_by_id(db, race_id: int):
    return db.get(Race, race_id)


def find_number(db, competition_id: int, race_number: int, exclude_id=None):
    statement = select(Race).where(
        Race.competition_id == competition_id,
        Race.race_number == race_number,
    )
    if exclude_id is not None:
        statement = statement.where(Race.id != exclude_id)
    return db.scalar(statement)


def create(db, data: dict):
    race = Race(**data)
    db.add(race)
    db.flush()
    return race


def has_entries(db, race_id: int):
    return db.scalar(select(RaceEntry.id).where(RaceEntry.race_id == race_id).limit(1)) is not None


def delete(db, race):
    db.delete(race)
