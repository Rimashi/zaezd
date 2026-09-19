from sqlalchemy import select

from app.models import RaceEntry, Team


def get_all(db, race_id=None):
    statement = select(RaceEntry).order_by(RaceEntry.race_id, RaceEntry.start_number)
    if race_id is not None:
        statement = statement.where(RaceEntry.race_id == race_id)
    return list(db.scalars(statement).all())


def get_by_id(db, entry_id: int):
    return db.get(RaceEntry, entry_id)


def create(db, data: dict):
    entry = RaceEntry(**data)
    db.add(entry)
    db.flush()
    return entry


def same_team_exists(db, race_id: int, team_id: int, exclude_id=None):
    statement = select(RaceEntry).where(RaceEntry.race_id == race_id, RaceEntry.team_id == team_id)
    if exclude_id is not None:
        statement = statement.where(RaceEntry.id != exclude_id)
    return db.scalar(statement) is not None


def start_number_exists(db, race_id: int, start_number: int, exclude_id=None):
    statement = select(RaceEntry).where(
        RaceEntry.race_id == race_id,
        RaceEntry.start_number == start_number,
    )
    if exclude_id is not None:
        statement = statement.where(RaceEntry.id != exclude_id)
    return db.scalar(statement) is not None


def horse_exists_in_race(db, race_id: int, horse_id: int, exclude_id=None):
    statement = (
        select(RaceEntry.id)
        .join(Team, Team.id == RaceEntry.team_id)
        .where(RaceEntry.race_id == race_id, Team.horse_id == horse_id)
    )
    if exclude_id is not None:
        statement = statement.where(RaceEntry.id != exclude_id)
    return db.scalar(statement.limit(1)) is not None


def jockey_exists_in_race(db, race_id: int, jockey_id: int, exclude_id=None):
    statement = (
        select(RaceEntry.id)
        .join(Team, Team.id == RaceEntry.team_id)
        .where(RaceEntry.race_id == race_id, Team.jockey_id == jockey_id)
    )
    if exclude_id is not None:
        statement = statement.where(RaceEntry.id != exclude_id)
    return db.scalar(statement.limit(1)) is not None


def delete(db, entry):
    db.delete(entry)
