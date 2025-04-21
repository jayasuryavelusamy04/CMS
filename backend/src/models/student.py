import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.core.database import Base

class AdmissionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Student(Base):
    __tablename__ = "students"
    __table_args__ = {'extend_existing': True}  # Allow table redefinition

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String(10), nullable=False)
    address = Column(String)
    phone_number = Column(String(20))
    guardian_id = Column(Integer, ForeignKey("guardians.id"), nullable=False)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    is_active = Column(Boolean, default=True)
    admission_status = Column(Enum(AdmissionStatus), default=AdmissionStatus.PENDING)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    guardian = relationship("Guardian", back_populates="students")
    class_section = relationship("ClassSection", back_populates="students")
    profile = relationship("StudentProfile", back_populates="student", uselist=False)
    fee_payments = relationship("FeePayment", back_populates="student")
