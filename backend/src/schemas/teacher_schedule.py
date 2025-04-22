from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from ..models.teacher_schedule import DayOfWeek

class TeacherAvailabilityBase(BaseModel):
    teacher_id: int
    day_of_week: DayOfWeek
    time_slots: List[Dict[str, Any]]  # [{start_time: "09:00", end_time: "10:00"}]
    academic_year: str

class TeacherAvailabilityCreate(TeacherAvailabilityBase):
    pass

class TeacherAvailability(TeacherAvailabilityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LeaveRequestBase(BaseModel):
    teacher_id: int
    start_date: datetime
    end_date: datetime
    reason: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: str
    approved_by: Optional[int] = None

class LeaveRequest(LeaveRequestBase):
    id: int
    status: str
    approved_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubstitutionBase(BaseModel):
    original_teacher_id: int
    substitute_teacher_id: int
    class_section_id: int
    subject_id: int
    date: datetime
    period_number: int
    reason: str

class SubstitutionCreate(SubstitutionBase):
    pass

class SubstitutionUpdate(BaseModel):
    status: str

class Substitution(SubstitutionBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoomAllocationBase(BaseModel):
    room_number: str
    class_section_id: Optional[int] = None
    purpose: str
    capacity: int
    features: List[str]
    is_available: bool = True

class RoomAllocationCreate(RoomAllocationBase):
    pass

class RoomAllocation(RoomAllocationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoomScheduleBase(BaseModel):
    room_id: int
    day_of_week: DayOfWeek
    period_number: int
    teacher_id: int
    class_section_id: int
    subject_id: int
    academic_year: str

class RoomScheduleCreate(RoomScheduleBase):
    pass

class RoomSchedule(RoomScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Response Schemas for aggregated data
class TeacherScheduleResponse(BaseModel):
    teacher_id: int
    schedule: Dict[str, List[Dict[str, Any]]]  # Organized by day_of_week
    
    class Config:
        orm_mode = True

class RoomScheduleResponse(BaseModel):
    room_id: int
    room_number: str
    schedule: Dict[str, List[Dict[str, Any]]]  # Organized by day_of_week
    
    class Config:
        orm_mode = True
