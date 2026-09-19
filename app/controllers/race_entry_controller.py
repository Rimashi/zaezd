from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import race_entry_service


def list_entries(race_id=None):
    with SessionLocal() as db:
        return race_entry_service.list_entries(db, race_id)


def get_entry(entry_id: int):
    with SessionLocal() as db:
        return model_to_dict(race_entry_service.get_entry(db, entry_id))


def create_entry(data):
    with SessionLocal() as db:
        result = race_entry_service.create_entry(db, data)
        db.commit()
        return result


def update_entry(entry_id: int, data):
    with SessionLocal() as db:
        result = race_entry_service.update_entry(db, entry_id, data)
        db.commit()
        return result


def delete_entry(entry_id: int):
    with SessionLocal() as db:
        result = race_entry_service.delete_entry(db, entry_id)
        db.commit()
        return result
