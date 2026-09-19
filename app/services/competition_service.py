from app.enums import CompetitionStatus, RaceStatus
from app.errors import AppError
from app.repositories import competition_repository
from app.serializers import model_to_dict, models_to_dict


def list_competitions(db):
    return models_to_dict(competition_repository.get_all(db))


def get_competition(db, competition_id: int):
    competition = competition_repository.get_by_id(db, competition_id)
    if competition is None:
        raise AppError("Соревнование не найдено", 404)
    return competition


def create_competition(db, data, organizer_id: int):
    values = data.model_dump()
    values["organizer_id"] = organizer_id
    competition = competition_repository.create(db, values)
    return model_to_dict(competition)


def validate_status_change(db, competition, new_status):
    old_status = competition.status
    if old_status == new_status:
        return

    allowed = {
        CompetitionStatus.PLANNED: {CompetitionStatus.IN_PROGRESS, CompetitionStatus.CANCELLED},
        CompetitionStatus.IN_PROGRESS: {CompetitionStatus.FINISHED, CompetitionStatus.CANCELLED},
        CompetitionStatus.FINISHED: set(),
        CompetitionStatus.CANCELLED: set(),
    }

    if new_status not in allowed[old_status]:
        raise AppError(f"Нельзя изменить статус соревнования с '{old_status.value}' на '{new_status.value}'", 409)

    races = competition_repository.get_races(db, competition.id)

    if new_status == CompetitionStatus.IN_PROGRESS and len(races) == 0:
        raise AppError("Нельзя начать соревнование без заездов", 409)

    if new_status == CompetitionStatus.FINISHED:
        unfinished = [race for race in races if race.status not in {RaceStatus.FINISHED, RaceStatus.CANCELLED}]
        if unfinished:
            raise AppError("Нельзя завершить соревнование: не все заезды завершены или отменены", 409)


def update_competition(db, competition_id: int, data):
    competition = get_competition(db, competition_id)
    values = data.model_dump(exclude_unset=True)
    values.pop("organizer_id", None)

    new_status = values.get("status")
    if new_status is not None:
        validate_status_change(db, competition, new_status)

    changing_regular_fields = any(key != "status" for key in values)
    if changing_regular_fields and competition.status != CompetitionStatus.PLANNED:
        raise AppError("Основные данные соревнования можно менять только пока оно запланировано", 409)

    for key, value in values.items():
        setattr(competition, key, value)

    db.flush()
    return model_to_dict(competition)


def delete_competition(db, competition_id: int):
    competition = get_competition(db, competition_id)
    if competition.status != CompetitionStatus.PLANNED:
        raise AppError("Удалить можно только запланированное соревнование", 409)

    if competition_repository.get_races(db, competition_id):
        raise AppError("Нельзя удалить соревнование, пока у него есть заезды", 409)

    competition_repository.delete(db, competition)
    return {"messages": []}
