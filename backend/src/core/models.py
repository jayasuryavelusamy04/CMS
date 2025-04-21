from datetime import datetime
from typing import Any, List
from sqlalchemy import (
    Column, DateTime, Integer, String, Enum, ForeignKey, 
    Text, Boolean, Date, Table
)
from sqlalchemy.orm import relationship as orm_relationship
import enum
from sqlalchemy.ext.declarative import declared_attr

from .database import Base

class TimestampMixin:
    """Mixin for adding timestamp fields to models"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class CoreBase:
    """Base class for all models"""
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    # Common columns for all models
    id = Column(Integer, primary_key=True, index=True)

class CoreModel(CoreBase, TimestampMixin, Base):
    """Base model class that includes timestamp fields"""
    __abstract__ = True

    def dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def update(self, **kwargs: Any) -> None:
        """Update model instance with given kwargs"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"

class User(CoreModel):
    """User model"""
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class AdmissionStatus(str, enum.Enum):
    PENDING = "pending"
    ADMITTED = "admitted"
    REJECTED = "rejected"

# Association table for student-guardian relationship
student_guardian = Table(
    'student_guardian',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('student.id')),
    Column('guardian_id', Integer, ForeignKey('guardian.id'))
)

class Student(CoreModel):
    """Student model"""
    # Personal Details
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    nationality = Column(String(50), nullable=False)
    
    # Contact Information
    email = Column(String(100), unique=True, index=True)
    phone_primary = Column(String(20), nullable=False)
    phone_secondary = Column(String(20))
    
    # Address Information
    address_permanent = Column(Text, nullable=False)
    address_temporary = Column(Text)
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    
    # Academic Information
    admission_date = Column(Date, nullable=False, default=datetime.utcnow)
    admission_number = Column(String(20), unique=True, nullable=False)
    current_class = Column(String(20))
    current_section = Column(String(10))
    admission_status = Column(
        Enum(AdmissionStatus),
        nullable=False,
        default=AdmissionStatus.PENDING
    )
    is_active = Column(Boolean, default=True)
    
    # Relationships
    guardians = orm_relationship(
        "Guardian",
        secondary=student_guardian,
        back_populates="students"
    )

class Guardian(CoreModel):
    """Guardian model"""
    # Personal Details
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    relationship = Column(String(30), nullable=False)
    
    # Contact Information
    email = Column(String(100), unique=True, index=True)
    phone_primary = Column(String(20), nullable=False)
    phone_secondary = Column(String(20))
    
    # Professional Details
    occupation = Column(String(100))
    
    # Address Information
    address = Column(Text, nullable=False)
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    
    # Portal Access
    has_portal_access = Column(Boolean, default=False)
    
    # Relationships
    students = orm_relationship(
        "Student",
        secondary=student_guardian,
        back_populates="guardians"
    )
