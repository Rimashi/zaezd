from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import DATABASE_URL


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def create_tables():
    # Импорт нужен, чтобы SQLAlchemy увидел все модели до create_all().
    from app.models import Base

    Base.metadata.create_all(bind=engine)
