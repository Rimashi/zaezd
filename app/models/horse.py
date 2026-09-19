from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, Enum as SQLEnum, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import HorseSex, HorseStatus
from app.models.base import Base


class Horse(Base):
    __tablename__ = "horses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    breed: Mapped[str] = mapped_column(String(150), nullable=False)
    owner: Mapped[str] = mapped_column(String(150), nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    sex: Mapped[HorseSex] = mapped_column(
        SQLEnum(HorseSex, name="horse_sex", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
    )
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    status: Mapped[HorseStatus] = mapped_column(
        SQLEnum(HorseStatus, name="horse_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=HorseStatus.ACTIVE,
    )

    teams = relationship("Team", back_populates="horse")

    __table_args__ = (
        CheckConstraint("weight_kg IS NULL OR weight_kg > 0", name="ck_horse_weight"),
        Index("ix_horses_name", "name"),
        Index("ix_horses_owner", "owner"),
    )
