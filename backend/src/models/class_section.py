from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.database import Base

class ClassSection(Base):
    __tablename__ = "class_sections"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(String(10), nullable=False)  # e.g., "Grade 10"
    section = Column(String(10), nullable=False)  # e.g., "A", "B", etc.
    academic_year = Column(String(20), nullable=False)  # e.g., "2024-2025"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    students = relationship("Student", back_populates="class_section")
    timetable_slots = relationship("TimetableSlot", back_populates="class_section")
    teaching_assignments = relationship("TeachingAssignment", back_populates="class_section")
