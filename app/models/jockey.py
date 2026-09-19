from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, Enum as SQLEnum, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import JockeyStatus
from app.models.base import Base


class Jockey(Base):
    __tablename__ = "jockeys"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    patronymic: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    qualification: Mapped[str | None] = mapped_column(String(150), nullable=True)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    status: Mapped[JockeyStatus] = mapped_column(
        SQLEnum(JockeyStatus, name="jockey_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=JockeyStatus.ACTIVE,
    )

    teams = relationship("Team", back_populates="jockey")

    __table_args__ = (
        CheckConstraint("weight_kg IS NULL OR weight_kg > 0", name="ck_jockey_weight"),
        Index("ix_jockeys_last_name", "last_name"),
    )
