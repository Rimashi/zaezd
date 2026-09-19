from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import result_service


def list_results():
    with SessionLocal() as db:
        return result_service.list_results(db)


def get_result(result_id: int):
    with SessionLocal() as db:
        return model_to_dict(result_service.get_result(db, result_id))


def create_result(data):
    with SessionLocal() as db:
        result = result_service.create_result(db, data)
        db.commit()
        return result


def update_result(result_id: int, data):
    with SessionLocal() as db:
        result = result_service.update_result(db, result_id, data)
        db.commit()
        return result


def delete_result(result_id: int):
    with SessionLocal() as db:
        result = result_service.delete_result(db, result_id)
        db.commit()
        return result
