from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

from src.core.database import Base  # Updated import path

class StaffRole(enum.Enum):
    TEACHER = "teacher"
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    LIBRARIAN = "librarian"

class Staff(Base):
    __tablename__ = "staff"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(StaffRole), nullable=False)
    date_of_birth = Column(DateTime)
    gender = Column(String(10))
    address = Column(String)
    phone_number = Column(String(20))
    hire_date = Column(DateTime, nullable=False, server_default=func.now())
    salary = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    teaching_assignments = relationship("TeachingAssignment", back_populates="staff")
    teaching_slots = relationship("TimetableSlot", back_populates="teaching_staff")
