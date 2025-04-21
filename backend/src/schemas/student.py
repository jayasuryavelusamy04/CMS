from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from .guardian import Guardian

class StudentBase(BaseModel):
    name: str
    email: EmailStr
    date_of_birth: datetime
    gender: str
    address: str
    phone_number: str

class StudentCreate(StudentBase):
    guardian_id: int
    class_section_id: Optional[int] = None
    password: str

class StudentUpdate(StudentBase):
    password: Optional[str] = None
    guardian_id: Optional[int] = None
    class_section_id: Optional[int] = None
    is_active: Optional[bool] = None

class StudentInDB(StudentBase):
    id: int
    guardian_id: int
    class_section_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Student(StudentInDB):
    guardian: Optional[Guardian] = None
