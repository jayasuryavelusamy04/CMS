from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime, time
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

# Period Schemas
class PeriodBase(BaseModel):
    name: str
    day_of_week: int
    start_time: time
    end_time: time
    class_section_id: int
    is_active: bool = True

    @validator('day_of_week')
    def validate_day_of_week(cls, v):
        if not 0 <= v <= 6:
            raise ValueError('day_of_week must be between 0 and 6')
        return v

    @validator('end_time')
    def validate_time_range(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class PeriodCreate(PeriodBase):
    pass

class PeriodUpdate(BaseModel):
    name: Optional[str]
    start_time: Optional[time]
    end_time: Optional[time]
    is_active: Optional[bool]

class Period(PeriodBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# TimetableSlot Schemas
class TimetableSlotBase(BaseModel):
    period_id: int
    subject_id: int
    teacher_id: int
    room: Optional[str]
    is_active: bool = True

class TimetableSlotCreate(TimetableSlotBase):
    pass

class TimetableSlotUpdate(BaseModel):
    subject_id: Optional[int]
    teacher_id: Optional[int]
    room: Optional[str]
    is_active: Optional[bool]

class TimetableSlot(TimetableSlotBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    student_id: int
    timetable_slot_id: int
    status: AttendanceStatus
    note: Optional[str]
    marked_by: int
    date: datetime

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus]
    note: Optional[str]

class Attendance(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# TimetableConfig Schemas
class TimetableConfigBase(BaseModel):
    academic_year: str
    class_section_id: int
    start_date: datetime
    end_date: datetime
    is_active: bool = True

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class TimetableConfigCreate(TimetableConfigBase):
    pass

class TimetableConfigUpdate(BaseModel):
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: Optional[bool]

class TimetableConfig(TimetableConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# TimetableChangeLog Schema
class TimetableChangeLogBase(BaseModel):
    timetable_slot_id: int
    changed_by: int
    change_type: str
    previous_data: Optional[str]
    new_data: Optional[str]
    reason: Optional[str]

class TimetableChangeLog(TimetableChangeLogBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Response Schemas
class PeriodList(BaseModel):
    total: int
    items: List[Period]

class TimetableSlotList(BaseModel):
    total: int
    items: List[TimetableSlot]

class AttendanceList(BaseModel):
    total: int
    items: List[Attendance]

class TimetableConfigList(BaseModel):
    total: int
    items: List[TimetableConfig]

class TimetableChangeLogList(BaseModel):
    total: int
    items: List[TimetableChangeLog]

# Attendance Report Schemas
class AttendanceReport(BaseModel):
    student_id: int
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    excused_days: int
    attendance_percentage: float
    period_wise_attendance: dict
    date_range: tuple[datetime, datetime]

class AttendanceReportParams(BaseModel):
    start_date: datetime
    end_date: datetime
    class_section_id: Optional[int]
    student_id: Optional[int]
    subject_id: Optional[int]
    report_type: str  # daily, monthly, yearly

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
