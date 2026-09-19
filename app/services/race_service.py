from app.enums import CompetitionStatus, RaceStatus
from app.errors import AppError
from app.repositories import competition_repository, race_repository
from app.serializers import model_to_dict, models_to_dict


def list_races(db, competition_id=None):
    return models_to_dict(race_repository.get_all(db, competition_id))


def get_race(db, race_id: int):
    race = race_repository.get_by_id(db, race_id)
    if race is None:
        raise AppError("Заезд не найден", 404)
    return race


def validate_number(db, competition_id: int, race_number: int, exclude_id=None):
    if race_repository.find_number(db, competition_id, race_number, exclude_id) is not None:
        raise AppError("В этом соревновании уже есть заезд с таким номером", 409, {"race_number": "Номер уже занят"})


def create_race(db, data):
    competition = competition_repository.get_by_id(db, data.competition_id)
    if competition is None:
        raise AppError("Соревнование не найдено", 404)
    if competition.status != CompetitionStatus.PLANNED:
        raise AppError("Добавлять заезды можно только в запланированное соревнование", 409)

    validate_number(db, data.competition_id, data.race_number)
    race = race_repository.create(db, data.model_dump())
    return model_to_dict(race)


def validate_status_change(competition, race, new_status):
    old_status = race.status
    if old_status == new_status:
        return

    allowed = {
        RaceStatus.PLANNED: {RaceStatus.IN_PROGRESS, RaceStatus.CANCELLED},
        RaceStatus.IN_PROGRESS: {RaceStatus.FINISHED, RaceStatus.CANCELLED},
        RaceStatus.FINISHED: set(),
        RaceStatus.CANCELLED: set(),
    }

    if new_status not in allowed[old_status]:
        raise AppError(f"Нельзя изменить статус заезда с '{old_status.value}' на '{new_status.value}'", 409)

    if new_status == RaceStatus.IN_PROGRESS and competition.status != CompetitionStatus.IN_PROGRESS:
        raise AppError("Сначала переведите соревнование в статус 'Идёт'", 409)


def update_race(db, race_id: int, data):
    race = get_race(db, race_id)
    competition = competition_repository.get_by_id(db, race.competition_id)
    values = data.model_dump(exclude_unset=True)

    if "competition_id" in values and values["competition_id"] != race.competition_id:
        raise AppError("Переносить заезд в другое соревнование нельзя", 409)

    new_status = values.get("status")
    if new_status is not None:
        validate_status_change(competition, race, new_status)

    changing_regular_fields = any(key not in {"status", "competition_id"} for key in values)
    if changing_regular_fields and race.status != RaceStatus.PLANNED:
        raise AppError("Параметры заезда можно менять только до его начала", 409)

    new_number = values.get("race_number")
    if new_number is not None and new_number != race.race_number:
        validate_number(db, race.competition_id, new_number, race.id)

    values.pop("competition_id", None)
    for key, value in values.items():
        setattr(race, key, value)

    db.flush()
    return model_to_dict(race)


def delete_race(db, race_id: int):
    race = get_race(db, race_id)
    if race.status != RaceStatus.PLANNED:
        raise AppError("Удалить можно только запланированный заезд", 409)
    if race_repository.has_entries(db, race_id):
        raise AppError("Нельзя удалить заезд, пока в нём есть участники", 409)

    race_repository.delete(db, race)
    return {"messages": []}
