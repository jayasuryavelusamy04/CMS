from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field
from typing_extensions import Annotated
from .guardian import GuardianCreate, GuardianResponse
from .class_section import ClassSectionResponse

class StudentBase(BaseModel):
    first_name: Annotated[str, Field(min_length=1, max_length=50)]
    middle_name: Optional[Annotated[str, Field(max_length=50)]] = None
    last_name: Annotated[str, Field(min_length=1, max_length=50)]
    date_of_birth: date
    gender: str
    contact_number: Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]
    email: Optional[EmailStr] = None
    nationality: Annotated[str, Field(min_length=1, max_length=50)]
    permanent_address: Annotated[str, Field(min_length=1, max_length=200)]
    temporary_address: Optional[Annotated[str, Field(max_length=200)]] = None

class StudentCreate(StudentBase):
    guardians: List[GuardianCreate]
    class_section_id: Optional[int] = None

class StudentUpdate(StudentBase):
    admission_status: Optional[str] = None
    class_section_id: Optional[int] = None

class StudentResponse(StudentBase):
    id: int
    admission_date: datetime
    admission_status: str
    created_at: datetime
    updated_at: Optional[datetime]
    guardians: List[GuardianResponse]
    class_section: Optional[ClassSectionResponse] = None

    class Config:
        from_attributes = True

class StudentList(BaseModel):
    total: int
    items: List[StudentResponse]
    
    class Config:
        from_attributes = True
