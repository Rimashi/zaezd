from app.errors import AppError
from app.repositories import jockey_repository
from app.serializers import model_to_dict, models_to_dict


def list_jockeys(db):
    return models_to_dict(jockey_repository.get_all(db))


def get_jockey(db, jockey_id: int):
    jockey = jockey_repository.get_by_id(db, jockey_id)
    if jockey is None:
        raise AppError("Жокей не найден", 404)
    return jockey


def create_jockey(db, data):
    jockey = jockey_repository.create(db, data.model_dump())
    return model_to_dict(jockey)


def update_jockey(db, jockey_id: int, data):
    jockey = get_jockey(db, jockey_id)
    values = data.model_dump(exclude_unset=True)

    for key, value in values.items():
        setattr(jockey, key, value)

    db.flush()
    return model_to_dict(jockey)


def delete_jockey(db, jockey_id: int):
    jockey = get_jockey(db, jockey_id)
    if jockey_repository.has_teams(db, jockey_id):
        raise AppError("Нельзя удалить жокея: он уже используется в команде", 409)

    jockey_repository.delete(db, jockey)
    return {"messages": []}
