from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Time, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.database import Base  # Updated import path

class Subject(Base):
    __tablename__ = "subjects"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(500))
    grade = Column(String(10), nullable=False)  # e.g., "Grade 10"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    timetable_slots = relationship("TimetableSlot", back_populates="subject")
    marks = relationship("Mark", back_populates="subject")
    teaching_assignments = relationship("TeachingAssignment", back_populates="subject")

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=False)
    teaching_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    start_time = Column(Time(), nullable=False)
    end_time = Column(Time(), nullable=False)
    room_number = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    subject = relationship("Subject", back_populates="timetable_slots")
    class_section = relationship("ClassSection", back_populates="timetable_slots")
    teaching_staff = relationship("Staff", back_populates="teaching_slots")
