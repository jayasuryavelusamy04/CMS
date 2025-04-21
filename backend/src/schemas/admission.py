from datetime import date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from typing_extensions import Annotated
from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class AdmissionStatus(str, Enum):
    PENDING = "pending"
    ADMITTED = "admitted"
    REJECTED = "rejected"

# Guardian Schemas
class GuardianBase(BaseModel):
    first_name: str
    last_name: str
    relationship: str
    email: EmailStr
    phone_primary: Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]
    phone_secondary: Optional[Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]]
    occupation: Optional[str]
    address: str
    city: str
    state: str
    country: str
    postal_code: str
    has_portal_access: bool = False

class GuardianCreate(GuardianBase):
    pass

class GuardianUpdate(GuardianBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    relationship: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_primary: Optional[Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class Guardian(GuardianBase):
    id: int
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    nationality: str
    email: Optional[EmailStr]
    phone_primary: Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]
    phone_secondary: Optional[Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]]
    address_permanent: str
    address_temporary: Optional[str]
    city: str
    state: str
    country: str
    postal_code: str
    current_class: Optional[str]
    current_section: Optional[str]

    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        if v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v

class StudentCreate(StudentBase):
    admission_number: str
    guardians: List[GuardianCreate]

class StudentUpdate(StudentBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    nationality: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_primary: Optional[Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]] = None
    address_permanent: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    admission_status: Optional[AdmissionStatus] = None
    is_active: Optional[bool] = None

class Student(StudentBase):
    id: int
    admission_date: date
    admission_number: str
    admission_status: AdmissionStatus
    is_active: bool
    guardians: List[Guardian]
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True

# Response Schemas
class AdmissionResponse(BaseModel):
    student: Student
    message: str

class StudentList(BaseModel):
    total: int
    students: List[Student]
    
class AdmissionStatusUpdate(BaseModel):
    admission_status: AdmissionStatus
    message: Optional[str]
