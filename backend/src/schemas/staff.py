from typing import List, Optional
from datetime import datetime, time
from pydantic import BaseModel, EmailStr, Field
from typing_extensions import Annotated

class StaffBase(BaseModel):
    employee_id: Annotated[str, Field(min_length=1, max_length=20)]
    first_name: Annotated[str, Field(min_length=1, max_length=50)]
    last_name: Annotated[str, Field(min_length=1, max_length=50)]
    email: EmailStr
    contact_number: Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]
    address: Annotated[str, Field(min_length=1, max_length=200)]
    role: str  # teacher, admin, non_teaching
    joining_date: datetime
    qualifications: Optional[str] = None
    is_active: bool = True

class StaffCreate(StaffBase):
    pass

class StaffUpdate(StaffBase):
    employee_id: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class StaffResponse(StaffBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TeacherSubjectBase(BaseModel):
    teacher_id: int
    subject_id: int
    is_primary: bool = False

class TeacherSubjectCreate(TeacherSubjectBase):
    pass

class TeacherSubjectUpdate(TeacherSubjectBase):
    is_primary: Optional[bool] = None

class TeacherSubjectResponse(TeacherSubjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class StaffAvailabilityBase(BaseModel):
    staff_id: int
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    is_available: bool = True
    reason: Optional[str] = None

class StaffAvailabilityCreate(StaffAvailabilityBase):
    pass

class StaffAvailabilityUpdate(StaffAvailabilityBase):
    is_available: Optional[bool] = None
    reason: Optional[str] = None

class StaffAvailabilityResponse(StaffAvailabilityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class StaffAuditLogBase(BaseModel):
    staff_id: int
    action: str
    details: str
    performed_by: int

class StaffAuditLogCreate(StaffAuditLogBase):
    pass

class StaffAuditLogResponse(StaffAuditLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StaffList(BaseModel):
    total: int
    items: List[StaffResponse]

    class Config:
        from_attributes = True

class TeacherSubjectList(BaseModel):
    total: int
    items: List[TeacherSubjectResponse]

    class Config:
        from_attributes = True

class StaffAvailabilityList(BaseModel):
    total: int
    items: List[StaffAvailabilityResponse]

    class Config:
        from_attributes = True
