from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from enum import Enum
from ..models.attendance import AttendanceStatus

class StatsTimeFrame(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class AttendanceStats(BaseModel):
    total_classes: int
    present: int
    absent: int
    late: int
    on_leave: int
    percentage: float

class AttendanceStatsRequest(BaseModel):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    start_date: date
    end_date: date
    time_frame: StatsTimeFrame = StatsTimeFrame.CUSTOM

class DailyAttendance(BaseModel):
    date: date
    status: AttendanceStatus

    class Config:
        from_attributes = True

class StudentAttendanceReport(BaseModel):
    student_id: int
    total_stats: AttendanceStats
    daily_records: List[DailyAttendance]

    class Config:
        from_attributes = True

class ClassAttendanceReport(BaseModel):
    class_id: int
    subject_id: Optional[int]
    total_stats: AttendanceStats
    student_stats: List[StudentAttendanceReport]

    class Config:
        from_attributes = True
