from typing import Optional, List
from datetime import datetime, time
from pydantic import BaseModel, Field
from typing_extensions import Annotated

class SubjectBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    code: Annotated[str, Field(min_length=1, max_length=20)]
    description: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TimetableSlotBase(BaseModel):
    class_section_id: int
    subject_id: int
    teacher_id: int
    day_of_week: int  # 0=Monday, 6=Sunday
    period: int
    start_time: time
    end_time: time
    room: Optional[str] = None

class TimetableSlotCreate(TimetableSlotBase):
    pass

class TimetableSlotUpdate(TimetableSlotBase):
    pass

class TimetableSlotResponse(TimetableSlotBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    subject: SubjectResponse

    class Config:
        from_attributes = True

class SubjectList(BaseModel):
    total: int
    items: List[SubjectResponse]

    class Config:
        from_attributes = True

class TimetableSlotList(BaseModel):
    total: int
    items: List[TimetableSlotResponse]

    class Config:
        from_attributes = True

# Schema for adding subjects to a class section
class ClassSectionSubjectAssignment(BaseModel):
    class_section_id: int
    subject_ids: List[int]
