from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class TeachingAssignment(Base):
    __tablename__ = "teaching_assignments"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=False)
    academic_year = Column(String(20), nullable=False)  # e.g., "2024-2025"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    staff = relationship("Staff", back_populates="teaching_assignments")
    subject = relationship("Subject", back_populates="teaching_assignments")
    class_section = relationship("ClassSection", back_populates="teaching_assignments")
