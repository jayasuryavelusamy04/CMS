from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from models.fees import FeeType, PaymentMode

class FeeStructureBase(BaseModel):
    class_section_id: int
    fee_type: FeeType
    amount: float
    due_date: datetime
    academic_year: str

class FeeStructureCreate(FeeStructureBase):
    pass

class FeeStructure(FeeStructureBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FeePaymentBase(BaseModel):
    student_id: int
    fee_structure_id: int
    amount_paid: float
    payment_mode: PaymentMode
    transaction_id: Optional[str] = None
    remarks: Optional[str] = None

class FeePaymentCreate(FeePaymentBase):
    pass

class FeePayment(FeePaymentBase):
    id: int
    payment_date: datetime
    payment_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentFeesSummary(BaseModel):
    student_id: int
    total_fees: float
    total_paid: float
    total_pending: float
    fee_payments: List[FeePayment]

    class Config:
        from_attributes = True
