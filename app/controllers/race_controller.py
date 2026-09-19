from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import race_service


def list_races(competition_id=None):
    with SessionLocal() as db:
        return race_service.list_races(db, competition_id)


def get_race(race_id: int):
    with SessionLocal() as db:
        return model_to_dict(race_service.get_race(db, race_id))


def create_race(data):
    with SessionLocal() as db:
        result = race_service.create_race(db, data)
        db.commit()
        return result


def update_race(race_id: int, data):
    with SessionLocal() as db:
        result = race_service.update_race(db, race_id, data)
        db.commit()
        return result


def delete_race(race_id: int):
    with SessionLocal() as db:
        result = race_service.delete_race(db, race_id)
        db.commit()
        return result
