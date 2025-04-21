from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from ..src.core.database import Base

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    OVERDUE = "overdue"

class PaymentMode(enum.Enum):
    CASH = "cash"
    CHEQUE = "cheque"
    ONLINE = "online"
    CARD = "card"
    UPI = "upi"

class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("class_sections.id"))
    amount = Column(Float, nullable=False)
    frequency = Column(String, nullable=False)  # monthly, quarterly, yearly
    due_day = Column(Integer)  # Day of month when fee is due
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    class_section = relationship("ClassSection", back_populates="fee_structures")
    fee_components = relationship("FeeComponent", back_populates="fee_structure")
    student_fees = relationship("StudentFee", back_populates="fee_structure")

class FeeComponent(Base):
    __tablename__ = "fee_components"

    id = Column(Integer, primary_key=True, index=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id"))
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    fee_structure = relationship("FeeStructure", back_populates="fee_components")
    payments = relationship("FeePayment", back_populates="fee_component")

class StudentFee(Base):
    __tablename__ = "student_fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id"))
    academic_year = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    due_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="fees")
    fee_structure = relationship("FeeStructure", back_populates="student_fees")
    payments = relationship("FeePayment", back_populates="student_fee")

class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(Integer, primary_key=True, index=True)
    student_fee_id = Column(Integer, ForeignKey("student_fees.id"))
    fee_component_id = Column(Integer, ForeignKey("fee_components.id"))
    amount = Column(Float, nullable=False)
    payment_mode = Column(Enum(PaymentMode), nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    transaction_id = Column(String)
    receipt_number = Column(String)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student_fee = relationship("StudentFee", back_populates="payments")
    fee_component = relationship("FeeComponent", back_populates="payments")
