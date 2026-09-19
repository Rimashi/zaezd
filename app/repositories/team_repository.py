from sqlalchemy import select

from app.models import RaceEntry, Team


def get_all(db, horse_id=None, jockey_id=None):
    statement = select(Team).order_by(Team.id)

    if horse_id is not None:
        statement = statement.where(Team.horse_id == horse_id)
    if jockey_id is not None:
        statement = statement.where(Team.jockey_id == jockey_id)

    return list(db.scalars(statement).all())


def get_by_id(db, team_id: int):
    return db.get(Team, team_id)


def find_pair(db, horse_id: int, jockey_id: int, exclude_id=None):
    statement = select(Team).where(Team.horse_id == horse_id, Team.jockey_id == jockey_id)
    if exclude_id is not None:
        statement = statement.where(Team.id != exclude_id)
    return db.scalar(statement)


def create(db, horse_id: int, jockey_id: int):
    team = Team(horse_id=horse_id, jockey_id=jockey_id)
    db.add(team)
    db.flush()
    return team


def is_used(db, team_id: int):
    return db.scalar(select(RaceEntry.id).where(RaceEntry.team_id == team_id).limit(1)) is not None


def delete(db, team):
    db.delete(team)
