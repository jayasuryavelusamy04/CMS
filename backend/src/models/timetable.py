from sqlalchemy import Column, Integer, String, Boolean, DateTime, Time, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class Period(Base):
    __tablename__ = "periods"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # e.g., "Period 1"
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    class_section = relationship("ClassSection", back_populates="periods")
    timetable_slots = relationship("TimetableSlot", back_populates="period", cascade="all, delete-orphan")

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    period_id = Column(Integer, ForeignKey("periods.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    room = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    period = relationship("Period", back_populates="timetable_slots")
    subject = relationship("Subject")
    teacher = relationship("Staff")
    attendances = relationship("Attendance", back_populates="timetable_slot")

class TimetableConfig(Base):
    __tablename__ = "timetable_config"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    academic_year = Column(String(20), nullable=False)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    class_section = relationship("ClassSection")

class TimetableChangeLog(Base):
    __tablename__ = "timetable_change_log"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_slot_id = Column(Integer, ForeignKey("timetable_slots.id"), nullable=False)
    changed_by = Column(Integer, ForeignKey("staff.id"), nullable=False)
    change_type = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    previous_data = Column(Text)  # JSON string of previous data
    new_data = Column(Text)  # JSON string of new data
    reason = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    timetable_slot = relationship("TimetableSlot")
    staff = relationship("Staff")
