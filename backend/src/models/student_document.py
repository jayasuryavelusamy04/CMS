from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class DocumentType(str, enum.Enum):
    PHOTO = "photo"
    BIRTH_CERTIFICATE = "birth_certificate"
    PREVIOUS_MARKSHEET = "previous_marksheet"
    TRANSFER_CERTIFICATE = "transfer_certificate"
    OTHER = "other"

class StudentDocument(Base):
    __tablename__ = "student_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    description = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationship
    student = relationship("Student", back_populates="documents")
