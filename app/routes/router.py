from fastapi import APIRouter

from app.routes import auth, competitions, health, horses, jockeys, race_entries, races, results, teams, users


api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["Авторизация"])
api_router.include_router(health.router, tags=["Служебное"])
api_router.include_router(users.router, prefix="/users", tags=["Пользователи"])
api_router.include_router(horses.router, prefix="/horses", tags=["Лошади"])
api_router.include_router(jockeys.router, prefix="/jockeys", tags=["Жокеи"])
api_router.include_router(teams.router, prefix="/teams", tags=["Команды"])
api_router.include_router(competitions.router, prefix="/competitions", tags=["Соревнования"])
api_router.include_router(races.router, prefix="/races", tags=["Заезды"])
api_router.include_router(race_entries.router, prefix="/race-entries", tags=["Состав заездов"])
api_router.include_router(results.router, prefix="/results", tags=["Результаты"])
