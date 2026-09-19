from sqlalchemy import ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    horse_id: Mapped[int] = mapped_column(ForeignKey("horses.id", ondelete="RESTRICT"), nullable=False)
    jockey_id: Mapped[int] = mapped_column(ForeignKey("jockeys.id", ondelete="RESTRICT"), nullable=False)

    horse = relationship("Horse", back_populates="teams")
    jockey = relationship("Jockey", back_populates="teams")
    race_entries = relationship("RaceEntry", back_populates="team")

    __table_args__ = (
        UniqueConstraint("horse_id", "jockey_id", name="uq_team_horse_jockey"),
        Index("ix_teams_horse", "horse_id"),
        Index("ix_teams_jockey", "jockey_id"),
    )
