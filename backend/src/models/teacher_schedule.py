from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, JSON
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class DayOfWeek(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"

class TeacherAvailability(Base):
    __tablename__ = "teacher_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("staff.id"))
    day_of_week = Column(Enum(DayOfWeek))
    time_slots = Column(JSON)  # Array of available time slots
    academic_year = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    teacher = relationship("Staff", back_populates="availabilities")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("staff.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    reason = Column(String)
    status = Column(String)  # PENDING, APPROVED, REJECTED
    approved_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    teacher = relationship("Staff", foreign_keys=[teacher_id], back_populates="leave_requests")
    approver = relationship("Staff", foreign_keys=[approved_by])

class Substitution(Base):
    __tablename__ = "substitutions"

    id = Column(Integer, primary_key=True, index=True)
    original_teacher_id = Column(Integer, ForeignKey("staff.id"))
    substitute_teacher_id = Column(Integer, ForeignKey("staff.id"))
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    date = Column(DateTime)
    period_number = Column(Integer)
    reason = Column(String)
    status = Column(String)  # PENDING, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    original_teacher = relationship("Staff", foreign_keys=[original_teacher_id])
    substitute_teacher = relationship("Staff", foreign_keys=[substitute_teacher_id])
    class_section = relationship("ClassSection")
    subject = relationship("Subject")

class RoomAllocation(Base):
    __tablename__ = "room_allocations"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=True)
    purpose = Column(String)  # REGULAR_CLASS, EXAM, EVENT
    capacity = Column(Integer)
    is_available = Column(Boolean, default=True)
    features = Column(JSON)  # Array of room features (projector, lab equipment, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    class_section = relationship("ClassSection")
    schedules = relationship("RoomSchedule", back_populates="room")

class RoomSchedule(Base):
    __tablename__ = "room_schedules"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("room_allocations.id"))
    day_of_week = Column(Enum(DayOfWeek))
    period_number = Column(Integer)
    teacher_id = Column(Integer, ForeignKey("staff.id"))
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    academic_year = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    room = relationship("RoomAllocation", back_populates="schedules")
    teacher = relationship("Staff")
    class_section = relationship("ClassSection")
    subject = relationship("Subject")
