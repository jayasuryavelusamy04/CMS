from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class StaffRole(str, enum.Enum):
    TEACHER = "teacher"
    ADMIN = "admin"
    NON_TEACHING = "non_teaching"

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    contact_number = Column(String(20), nullable=False)
    address = Column(String(200), nullable=False)
    role = Column(Enum(StaffRole), nullable=False)
    joining_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    qualifications = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    teaching_subjects = relationship("TeacherSubject", back_populates="teacher", cascade="all, delete-orphan")
    availabilities = relationship("StaffAvailability", back_populates="staff", cascade="all, delete-orphan")
    timetable_slots = relationship("TimetableSlot", back_populates="teacher")

class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    teacher = relationship("Staff", back_populates="teaching_subjects")
    subject = relationship("Subject", back_populates="teachers")

class StaffAvailability(Base):
    __tablename__ = "staff_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)
    reason = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    staff = relationship("Staff", back_populates="availabilities")

class StaffAuditLog(Base):
    __tablename__ = "staff_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    details = Column(String(500), nullable=False)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

