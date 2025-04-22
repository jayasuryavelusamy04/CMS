from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Guardian(Base):
    __tablename__ = "guardians"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    relation_type = Column(String(50), nullable=False)  # Changed from relationship to relation_type
    contact_number = Column(String(20), nullable=False)
    email = Column(String(100))
    occupation = Column(String(100))
    address = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationship
    students = relationship("Student", back_populates="guardian")
