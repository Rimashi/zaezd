from app.errors import AppError
from app.repositories import horse_repository, jockey_repository, team_repository
from app.serializers import model_to_dict, models_to_dict


def list_teams(db, horse_id=None, jockey_id=None):
    return models_to_dict(team_repository.get_all(db, horse_id, jockey_id))


def get_team(db, team_id: int):
    team = team_repository.get_by_id(db, team_id)
    if team is None:
        raise AppError("Команда не найдена", 404)
    return team


def check_pair(db, horse_id: int, jockey_id: int, exclude_id=None):
    if horse_repository.get_by_id(db, horse_id) is None:
        raise AppError("Лошадь не найдена", 404, {"horse_id": "Лошадь не найдена"})

    if jockey_repository.get_by_id(db, jockey_id) is None:
        raise AppError("Жокей не найден", 404, {"jockey_id": "Жокей не найден"})

    if team_repository.find_pair(db, horse_id, jockey_id, exclude_id) is not None:
        raise AppError("Такая пара лошади и жокея уже существует", 409)


def create_team(db, data):
    check_pair(db, data.horse_id, data.jockey_id)
    team = team_repository.create(db, data.horse_id, data.jockey_id)
    return model_to_dict(team)


def update_team(db, team_id: int, data):
    team = get_team(db, team_id)
    values = data.model_dump(exclude_unset=True)

    horse_id = values.get("horse_id", team.horse_id)
    jockey_id = values.get("jockey_id", team.jockey_id)

    changed = horse_id != team.horse_id or jockey_id != team.jockey_id
    if changed and team_repository.is_used(db, team.id):
        raise AppError("Нельзя менять состав команды, которая уже участвовала в заезде. Создайте новую команду", 409)

    check_pair(db, horse_id, jockey_id, team.id)
    team.horse_id = horse_id
    team.jockey_id = jockey_id
    db.flush()
    return model_to_dict(team)


def delete_team(db, team_id: int):
    team = get_team(db, team_id)
    if team_repository.is_used(db, team_id):
        raise AppError("Нельзя удалить команду: она уже использовалась в заезде", 409)

    team_repository.delete(db, team)
    return {"messages": []}
