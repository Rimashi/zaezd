from datetime import time

from sqlalchemy import CheckConstraint, Enum as SQLEnum, ForeignKey, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import RaceStatus
from app.models.base import Base


class Race(Base):
    __tablename__ = "races"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id", ondelete="RESTRICT"), nullable=False)
    race_number: Mapped[int] = mapped_column(nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    distance_m: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[RaceStatus] = mapped_column(
        SQLEnum(RaceStatus, name="race_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=RaceStatus.PLANNED,
    )

    competition = relationship("Competition", back_populates="races")
    race_entries = relationship("RaceEntry", back_populates="race")

    __table_args__ = (
        UniqueConstraint("competition_id", "race_number", name="uq_race_number_in_competition"),
        CheckConstraint("race_number > 0", name="ck_race_number_positive"),
        CheckConstraint("distance_m > 0", name="ck_race_distance_positive"),
    )
