from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Boolean, Enum
import enum
from ..database import Base
from core.models import CoreModel

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    TEACHER = "teacher"
    PARENT = "parent"

class User(CoreModel):
    """User model for authentication"""
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)

    def dict(self, exclude: Optional[set] = None) -> dict:
        """Convert model to dictionary excluding sensitive fields"""
        exclude = exclude or {"hashed_password"}
        data = super().dict()
        for field in exclude:
            data.pop(field, None)
        return data
