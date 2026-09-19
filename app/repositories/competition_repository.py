from sqlalchemy import select

from app.models import Competition, Race


def get_all(db):
    return list(db.scalars(select(Competition).order_by(Competition.competition_date.desc(), Competition.id.desc())).all())


def get_by_id(db, competition_id: int):
    return db.get(Competition, competition_id)


def create(db, data: dict):
    competition = Competition(**data)
    db.add(competition)
    db.flush()
    return competition


def get_races(db, competition_id: int):
    statement = select(Race).where(Race.competition_id == competition_id).order_by(Race.race_number)
    return list(db.scalars(statement).all())


def delete(db, competition):
    db.delete(competition)
