from sqlalchemy import BigInteger, CheckConstraint, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import ResultStatus
from app.models.base import Base


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    race_entry_id: Mapped[int] = mapped_column(ForeignKey("race_entries.id", ondelete="RESTRICT"), nullable=False, unique=True)
    position: Mapped[int | None] = mapped_column(nullable=True)
    finish_time_ms: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    status: Mapped[ResultStatus] = mapped_column(
        SQLEnum(ResultStatus, name="result_status", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
    )

    race_entry = relationship("RaceEntry", back_populates="result")

    __table_args__ = (
        CheckConstraint("position IS NULL OR position > 0", name="ck_result_position_positive"),
        CheckConstraint("finish_time_ms IS NULL OR finish_time_ms > 0", name="ck_result_time_positive"),
    )
