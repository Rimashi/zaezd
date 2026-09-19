from app.enums import CompetitionStatus, HorseStatus, JockeyStatus, RaceEntryStatus, RaceStatus
from app.errors import AppError
from app.repositories import (
    competition_repository,
    race_entry_repository,
    race_repository,
    result_repository,
    team_repository,
)
from app.serializers import model_to_dict, models_to_dict


def list_entries(db, race_id=None):
    return models_to_dict(race_entry_repository.get_all(db, race_id))


def get_entry(db, entry_id: int):
    entry = race_entry_repository.get_by_id(db, entry_id)
    if entry is None:
        raise AppError("Участие в заезде не найдено", 404)
    return entry


def validate_entry(db, race_id: int, team_id: int, start_number: int, status, withdrawal_reason, exclude_id=None):
    race = race_repository.get_by_id(db, race_id)
    if race is None:
        raise AppError("Заезд не найден", 404, {"race_id": "Заезд не найден"})

    competition = competition_repository.get_by_id(db, race.competition_id)
    if race.status != RaceStatus.PLANNED:
        raise AppError("Состав заезда можно менять только до его начала", 409)
    if competition.status in {CompetitionStatus.FINISHED, CompetitionStatus.CANCELLED}:
        raise AppError("Состав завершённого или отменённого соревнования менять нельзя", 409)

    team = team_repository.get_by_id(db, team_id)
    if team is None:
        raise AppError("Команда не найдена", 404, {"team_id": "Команда не найдена"})

    if team.horse.status != HorseStatus.ACTIVE:
        raise AppError("Эта лошадь сейчас не может участвовать в заезде", 409, {"team_id": "Лошадь команды не активна"})
    if team.jockey.status != JockeyStatus.ACTIVE:
        raise AppError("Этот жокей сейчас не может участвовать в заезде", 409, {"team_id": "Жокей команды не активен"})

    if race_entry_repository.same_team_exists(db, race_id, team_id, exclude_id):
        raise AppError("Эта команда уже заявлена в заезд", 409)
    if race_entry_repository.horse_exists_in_race(db, race_id, team.horse_id, exclude_id):
        raise AppError("Эта лошадь уже участвует в заезде через другую команду", 409)
    if race_entry_repository.jockey_exists_in_race(db, race_id, team.jockey_id, exclude_id):
        raise AppError("Этот жокей уже участвует в заезде через другую команду", 409)
    if race_entry_repository.start_number_exists(db, race_id, start_number, exclude_id):
        raise AppError("Этот стартовый номер уже занят", 409, {"start_number": "Номер уже занят"})

    if status == RaceEntryStatus.WITHDRAWN and not str(withdrawal_reason or "").strip():
        raise AppError("Для снятого участника укажите причину", 400, {"withdrawal_reason": "Укажите причину снятия"})


def create_entry(db, data):
    validate_entry(
        db,
        data.race_id,
        data.team_id,
        data.start_number,
        data.status,
        data.withdrawal_reason,
    )
    entry = race_entry_repository.create(db, data.model_dump())
    return model_to_dict(entry)


def update_entry(db, entry_id: int, data):
    entry = get_entry(db, entry_id)
    values = data.model_dump(exclude_unset=True)

    race_id = values.get("race_id", entry.race_id)
    team_id = values.get("team_id", entry.team_id)
    start_number = values.get("start_number", entry.start_number)
    status = values.get("status", entry.status)
    withdrawal_reason = values.get("withdrawal_reason", entry.withdrawal_reason)

    validate_entry(db, race_id, team_id, start_number, status, withdrawal_reason, entry.id)

    if status == RaceEntryStatus.REGISTERED:
        withdrawal_reason = None
        values["withdrawal_reason"] = None

    for key, value in values.items():
        setattr(entry, key, value)

    db.flush()
    return model_to_dict(entry)


def delete_entry(db, entry_id: int):
    entry = get_entry(db, entry_id)
    race = race_repository.get_by_id(db, entry.race_id)

    if race.status != RaceStatus.PLANNED:
        raise AppError("Удалить участие можно только до начала заезда", 409)
    if result_repository.get_by_entry(db, entry.id) is not None:
        raise AppError("Нельзя удалить участие, у которого уже есть результат", 409)

    race_entry_repository.delete(db, entry)
    return {"messages": []}
