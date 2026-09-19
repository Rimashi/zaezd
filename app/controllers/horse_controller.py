from app.database import SessionLocal
from app.services import horse_service
from app.serializers import model_to_dict


def list_horses():
    with SessionLocal() as db:
        return horse_service.list_horses(db)


def get_horse(horse_id: int):
    with SessionLocal() as db:
        return model_to_dict(horse_service.get_horse(db, horse_id))


def create_horse(data):
    with SessionLocal() as db:
        result = horse_service.create_horse(db, data)
        db.commit()
        return result


def update_horse(horse_id: int, data):
    with SessionLocal() as db:
        result = horse_service.update_horse(db, horse_id, data)
        db.commit()
        return result


def delete_horse(horse_id: int):
    with SessionLocal() as db:
        result = horse_service.delete_horse(db, horse_id)
        db.commit()
        return result
