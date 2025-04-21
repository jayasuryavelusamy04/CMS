from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class GuardianBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    relationship: str
    address: str
    occupation: Optional[str] = None

class GuardianCreate(GuardianBase):
    pass

class GuardianUpdate(GuardianBase):
    is_active: Optional[bool] = None

class GuardianInDB(GuardianBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Guardian(GuardianInDB):
    pass
