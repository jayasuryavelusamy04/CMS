from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    current_grade = Column(String(10), nullable=False)
    roll_number = Column(String(20), unique=True, nullable=False)
    section = Column(String(10))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="profile")
    attendances = relationship("Attendance", back_populates="student_profile")
    marks = relationship("Mark", back_populates="student_profile")

class Mark(Base):
    __tablename__ = "marks"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_type = Column(String(50), nullable=False)  # e.g., "midterm", "final"
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    remarks = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="marks")
    subject = relationship("Subject")
