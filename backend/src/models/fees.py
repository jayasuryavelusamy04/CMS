from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .base import Base

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"

class FeeType(enum.Enum):
    TUITION = "tuition"
    EXAM = "exam"
    TRANSPORT = "transport"
    LIBRARY = "library"
    OTHER = "other"

class FeePayment(Base):
    __tablename__ = "fee_payments"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    fee_type = Column(Enum(FeeType), nullable=False)
    amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0)
    due_date = Column(DateTime, nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    payment_date = Column(DateTime)
    receipt_number = Column(String(50))
    remarks = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="fee_payments")
