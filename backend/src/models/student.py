from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class AdmissionStatus(str, enum.Enum):
    ADMITTED = "admitted"
    PENDING = "pending"
    REJECTED = "rejected"

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50))
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    contact_number = Column(String(20), nullable=False)
    email = Column(String(100))
    nationality = Column(String(50), nullable=False)
    permanent_address = Column(String(200), nullable=False)
    temporary_address = Column(String(200))
    admission_date = Column(DateTime, server_default=func.now())
    admission_status = Column(Enum(AdmissionStatus), default=AdmissionStatus.PENDING)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    guardians = relationship("Guardian", back_populates="student", cascade="all, delete-orphan")
    documents = relationship("StudentDocument", back_populates="student", cascade="all, delete-orphan")
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    class_section = relationship("ClassSection", back_populates="students")
