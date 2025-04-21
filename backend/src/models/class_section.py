from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class ClassSection(Base):
    __tablename__ = "class_sections"
    
    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    subjects = Column(JSON, nullable=False, default=list)
    academic_year = Column(String(9), nullable=False)  # Format: 2024-2025
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationship
    students = relationship("Student", back_populates="class_section")

    class Config:
        orm_mode = True
