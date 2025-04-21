from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from core.database import Base

class FeeType(str, enum.Enum):
    TUITION = "TUITION"
    ACTIVITY = "ACTIVITY" 
    LIBRARY = "LIBRARY"
    SPORTS = "SPORTS"
    EXAM = "EXAM"
    OTHER = "OTHER"

class PaymentMode(str, enum.Enum):
    CASH = "CASH"
    CHEQUE = "CHEQUE" 
    CARD = "CARD"
    UPI = "UPI"
    NET_BANKING = "NET_BANKING"
    
class FeeStructure(Base):
    __tablename__ = "fee_structures"
    
    id = Column(Integer, primary_key=True, index=True)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    fee_type = Column(Enum(FeeType))
    amount = Column(Float)
    due_date = Column(DateTime)
    academic_year = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    class_section = relationship("ClassSection", back_populates="fee_structures")
    fee_payments = relationship("FeePayment", back_populates="fee_structure")

class FeePayment(Base):
    __tablename__ = "fee_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id")) 
    amount_paid = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_mode = Column(Enum(PaymentMode))
    transaction_id = Column(String, nullable=True)
    payment_status = Column(String) # SUCCESS/PENDING/FAILED
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="fee_payments")
    fee_structure = relationship("FeeStructure", back_populates="fee_payments")
