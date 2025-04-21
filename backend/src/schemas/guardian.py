from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing_extensions import Annotated

class GuardianBase(BaseModel):
    full_name: Annotated[str, Field(min_length=1, max_length=100)]
    relationship: Annotated[str, Field(min_length=1, max_length=50)]
    contact_number: Annotated[str, Field(pattern=r'^\+?1?\d{9,15}$')]
    email: Optional[EmailStr] = None
    occupation: Optional[Annotated[str, Field(max_length=100)]] = None
    address: Optional[Annotated[str, Field(max_length=200)]] = None

class GuardianCreate(GuardianBase):
    pass

class GuardianUpdate(GuardianBase):
    pass

class GuardianResponse(GuardianBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
