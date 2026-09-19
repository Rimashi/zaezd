from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import competition_service


def list_competitions():
    with SessionLocal() as db:
        return competition_service.list_competitions(db)


def get_competition(competition_id: int):
    with SessionLocal() as db:
        return model_to_dict(competition_service.get_competition(db, competition_id))


def create_competition(data, organizer_id: int):
    with SessionLocal() as db:
        result = competition_service.create_competition(db, data, organizer_id)
        db.commit()
        return result


def update_competition(competition_id: int, data):
    with SessionLocal() as db:
        result = competition_service.update_competition(db, competition_id, data)
        db.commit()
        return result


def delete_competition(competition_id: int):
    with SessionLocal() as db:
        result = competition_service.delete_competition(db, competition_id)
        db.commit()
        return result
