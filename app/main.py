from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal, create_tables
from app.errors import AppError
from app.routes.router import api_router
from app.services.user_service import ensure_default_admin


app = FastAPI(
    title="Horse Racing API",
    version="0.1.0",
)

app.include_router(api_router)


@app.on_event("startup")
def startup():
    create_tables()

    with SessionLocal() as db:
        ensure_default_admin(db)


@app.exception_handler(AppError)
def app_error_handler(request: Request, error: AppError):
    return JSONResponse(
        status_code=error.status_code,
        content={
            "error": error.message,
            "fields": error.fields,
        },
    )


@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, error: RequestValidationError):
    fields = {}

    for item in error.errors():
        location = item.get("loc", [])
        field_name = str(location[-1]) if location else "data"
        fields[field_name] = item.get("msg", "Некорректное значение")

    return JSONResponse(
        status_code=422,
        content={
            "error": "Проверьте данные формы",
            "fields": fields,
        },
    )


@app.exception_handler(IntegrityError)
def integrity_error_handler(request: Request, error: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "error": "Операция нарушает ограничения базы данных",
            "fields": {},
        },
    )


# API подключается выше, поэтому /api/... обрабатывается FastAPI.
# Всё остальное отдаём фронтенду.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
