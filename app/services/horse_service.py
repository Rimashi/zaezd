from app.errors import AppError
from app.repositories import horse_repository
from app.serializers import model_to_dict, models_to_dict


def list_horses(db):
    return models_to_dict(horse_repository.get_all(db))


def get_horse(db, horse_id: int):
    horse = horse_repository.get_by_id(db, horse_id)
    if horse is None:
        raise AppError("Лошадь не найдена", 404)
    return horse


def create_horse(db, data):
    horse = horse_repository.create(db, data.model_dump())
    return model_to_dict(horse)


def update_horse(db, horse_id: int, data):
    horse = get_horse(db, horse_id)
    values = data.model_dump(exclude_unset=True)

    for key, value in values.items():
        setattr(horse, key, value)

    db.flush()
    return model_to_dict(horse)


def delete_horse(db, horse_id: int):
    horse = get_horse(db, horse_id)
    if horse_repository.has_teams(db, horse_id):
        raise AppError("Нельзя удалить лошадь: она уже используется в команде", 409)

    horse_repository.delete(db, horse)
    return {"messages": []}
