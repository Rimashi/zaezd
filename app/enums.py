from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"


class HorseSex(str, Enum):
    STALLION = "stallion"
    MARE = "mare"
    GELDING = "gelding"


class HorseStatus(str, Enum):
    ACTIVE = "active"
    INJURED = "injured"
    RETIRED = "retired"
    DECEASED = "deceased"


class JockeyStatus(str, Enum):
    ACTIVE = "active"
    INJURED = "injured"
    SUSPENDED = "suspended"
    RETIRED = "retired"


class CompetitionStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class RaceStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class RaceEntryStatus(str, Enum):
    REGISTERED = "registered"
    WITHDRAWN = "withdrawn"


class ResultStatus(str, Enum):
    FINISHED = "finished"
    DID_NOT_FINISH = "did_not_finish"
    DID_NOT_START = "did_not_start"
    DISQUALIFIED = "disqualified"
