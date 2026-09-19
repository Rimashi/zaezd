from app.database import SessionLocal
from app.serializers import model_to_dict
from app.services import team_service


def list_teams(horse_id=None, jockey_id=None):
    with SessionLocal() as db:
        return team_service.list_teams(db, horse_id, jockey_id)


def get_team(team_id: int):
    with SessionLocal() as db:
        return model_to_dict(team_service.get_team(db, team_id))


def create_team(data):
    with SessionLocal() as db:
        result = team_service.create_team(db, data)
        db.commit()
        return result


def update_team(team_id: int, data):
    with SessionLocal() as db:
        result = team_service.update_team(db, team_id, data)
        db.commit()
        return result


def delete_team(team_id: int):
    with SessionLocal() as db:
        result = team_service.delete_team(db, team_id)
        db.commit()
        return result
