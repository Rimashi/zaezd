from sqlalchemy import select

from app.models import RaceEntry, Result
from app.enums import ResultStatus


def get_all(db):
    return list(db.scalars(select(Result).order_by(Result.id)).all())


def get_by_id(db, result_id: int):
    return db.get(Result, result_id)


def get_by_entry(db, entry_id: int):
    return db.scalar(select(Result).where(Result.race_entry_id == entry_id))


def create(db, data: dict):
    result = Result(**data)
    db.add(result)
    db.flush()
    return result


def position_exists(db, race_id: int, position: int, exclude_result_id=None):
    statement = (
        select(Result.id)
        .join(RaceEntry, RaceEntry.id == Result.race_entry_id)
        .where(RaceEntry.race_id == race_id, Result.position == position, Result.status == ResultStatus.FINISHED)
    )
    if exclude_result_id is not None:
        statement = statement.where(Result.id != exclude_result_id)
    return db.scalar(statement.limit(1)) is not None


def delete(db, result):
    db.delete(result)
