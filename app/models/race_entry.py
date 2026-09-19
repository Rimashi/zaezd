from sqlalchemy import CheckConstraint, Enum as SQLEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import RaceEntryStatus
from app.models.base import Base


class RaceEntry(Base):
    __tablename__ = "race_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.id", ondelete="RESTRICT"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False)
    start_number: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[RaceEntryStatus] = mapped_column(
        SQLEnum(RaceEntryStatus, name="race_entry_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=RaceEntryStatus.REGISTERED,
    )
    withdrawal_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    race = relationship("Race", back_populates="race_entries")
    team = relationship("Team", back_populates="race_entries")
    result = relationship("Result", back_populates="race_entry", uselist=False)

    __table_args__ = (
        UniqueConstraint("race_id", "team_id", name="uq_race_entry_team"),
        UniqueConstraint("race_id", "start_number", name="uq_race_entry_start_number"),
        CheckConstraint("start_number > 0", name="ck_race_entry_start_number_positive"),
    )
