from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Guardian(Base):
    __tablename__ = "guardians"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    full_name = Column(String(100), nullable=False)
    relation_type = Column(String(50), nullable=False)  # Changed from relationship to relation_type
    contact_number = Column(String(20), nullable=False)
    email = Column(String(100))
    occupation = Column(String(100))
    address = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationship
    student = relationship("Student", back_populates="guardians")
