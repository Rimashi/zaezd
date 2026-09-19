from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import jockey_service


def list_jockeys():
    with SessionLocal() as db:
        return jockey_service.list_jockeys(db)


def get_jockey(jockey_id: int):
    with SessionLocal() as db:
        return model_to_dict(jockey_service.get_jockey(db, jockey_id))


def create_jockey(data):
    with SessionLocal() as db:
        result = jockey_service.create_jockey(db, data)
        db.commit()
        return result


def update_jockey(jockey_id: int, data):
    with SessionLocal() as db:
        result = jockey_service.update_jockey(db, jockey_id, data)
        db.commit()
        return result


def delete_jockey(jockey_id: int):
    with SessionLocal() as db:
        result = jockey_service.delete_jockey(db, jockey_id)
        db.commit()
        return result
