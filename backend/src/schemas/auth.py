from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
