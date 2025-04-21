from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from typing_extensions import Annotated
from datetime import datetime
from .user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None

class UserBase(BaseModel):
    username: Annotated[str, Field(min_length=3, max_length=50)]
    email: EmailStr
    full_name: Annotated[str, Field(min_length=1, max_length=100)]
    role: UserRole

class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8, max_length=100)]

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    password: Optional[Annotated[str, Field(min_length=8, max_length=100)]] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: Annotated[str, Field(min_length=8, max_length=100)]

class LoginResponse(BaseModel):
    token: Token
    user: User
