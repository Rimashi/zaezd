from fastapi import APIRouter

from app.controllers import health_controller


router = APIRouter()


@router.get("/health")
def health():
    return health_controller.health()
