from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from src.models.student_profile import AttendanceStatus  # Updated import path

class StudentProfileBase(BaseModel):
    student_id: int
    current_grade: str
    roll_number: str
    section: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileInDB(StudentProfileBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentProfile(StudentProfileInDB):
    pass

class AttendanceBase(BaseModel):
    student_profile_id: int
    date: datetime
    status: AttendanceStatus
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    pass

class AttendanceInDB(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Attendance(AttendanceInDB):
    pass

class MarkBase(BaseModel):
    student_profile_id: int
    subject_id: int
    exam_type: str  # e.g., "midterm", "final"
    score: float
    max_score: float
    remarks: Optional[str] = None

class MarkCreate(MarkBase):
    pass

class MarkUpdate(MarkBase):
    pass

class MarkInDB(MarkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Mark(MarkInDB):
    pass
