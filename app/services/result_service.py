from app.enums import CompetitionStatus, RaceEntryStatus, RaceStatus, ResultStatus
from app.errors import AppError
from app.repositories import competition_repository, race_entry_repository, race_repository, result_repository
from app.serializers import model_to_dict, models_to_dict


def list_results(db):
    return models_to_dict(result_repository.get_all(db))


def get_result(db, result_id: int):
    result = result_repository.get_by_id(db, result_id)
    if result is None:
        raise AppError("Результат не найден", 404)
    return result


def validate_result(db, entry_id: int, position, finish_time_ms, status, exclude_result_id=None):
    entry = race_entry_repository.get_by_id(db, entry_id)
    if entry is None:
        raise AppError("Участие в заезде не найдено", 404, {"race_entry_id": "Участие не найдено"})

    race = race_repository.get_by_id(db, entry.race_id)
    competition = competition_repository.get_by_id(db, race.competition_id)

    if entry.status == RaceEntryStatus.WITHDRAWN:
        raise AppError("Нельзя записать результат для участника, снятого с заезда", 409)
    if race.status != RaceStatus.FINISHED:
        raise AppError("Результат можно добавить только после завершения заезда", 409)
    if competition.status == CompetitionStatus.FINISHED:
        raise AppError("Результаты завершённого соревнования менять нельзя", 409)

    if status == ResultStatus.FINISHED:
        if position is None:
            raise AppError("Для финишировавшего участника укажите место", 400, {"position": "Укажите место"})
        if finish_time_ms is None:
            raise AppError("Для финишировавшего участника укажите время", 400, {"finish_time_ms": "Укажите время"})

        if result_repository.position_exists(db, race.id, position, exclude_result_id):
            raise AppError("Это место уже занято другим участником этого заезда", 409, {"position": "Место уже занято"})


def create_result(db, data):
    if result_repository.get_by_entry(db, data.race_entry_id) is not None:
        raise AppError("Для этого участия результат уже существует", 409)

    validate_result(db, data.race_entry_id, data.position, data.finish_time_ms, data.status)
    result = result_repository.create(db, data.model_dump())
    return model_to_dict(result)


def update_result(db, result_id: int, data):
    result = get_result(db, result_id)
    values = data.model_dump(exclude_unset=True)

    entry_id = values.get("race_entry_id", result.race_entry_id)
    if entry_id != result.race_entry_id:
        raise AppError("Переносить результат к другому участию нельзя", 409)

    position = values.get("position", result.position)
    finish_time_ms = values.get("finish_time_ms", result.finish_time_ms)
    status = values.get("status", result.status)

    validate_result(db, entry_id, position, finish_time_ms, status, result.id)

    for key, value in values.items():
        setattr(result, key, value)

    db.flush()
    return model_to_dict(result)


def delete_result(db, result_id: int):
    result = get_result(db, result_id)
    entry = race_entry_repository.get_by_id(db, result.race_entry_id)
    race = race_repository.get_by_id(db, entry.race_id)
    competition = competition_repository.get_by_id(db, race.competition_id)

    if competition.status == CompetitionStatus.FINISHED:
        raise AppError("Результаты завершённого соревнования удалять нельзя", 409)

    result_repository.delete(db, result)
    return {"messages": []}
