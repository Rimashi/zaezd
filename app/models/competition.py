from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, Enum as SQLEnum, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import CompetitionStatus
from app.models.base import Base


class Competition(Base):
    __tablename__ = "competitions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    competition_date: Mapped[date] = mapped_column(Date, nullable=False)
    hippodrome_name: Mapped[str] = mapped_column(String(200), nullable=False)
    race_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    surface_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    prize_fund: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    status: Mapped[CompetitionStatus] = mapped_column(
        SQLEnum(CompetitionStatus, name="competition_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=CompetitionStatus.PLANNED,
    )

    organizer = relationship("User", back_populates="competitions")
    races = relationship("Race", back_populates="competition")

    __table_args__ = (
        CheckConstraint("prize_fund IS NULL OR prize_fund >= 0", name="ck_competition_prize_fund"),
        Index("ix_competitions_date", "competition_date"),
        Index("ix_competitions_organizer", "organizer_id"),
    )
