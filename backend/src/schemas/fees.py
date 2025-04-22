from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from ..models.fees import FeeType, PaymentStatus

class FeePaymentBase(BaseModel):
    student_id: int
    fee_type: FeeType
    amount: float
    paid_amount: float = 0
    due_date: datetime
    status: PaymentStatus = PaymentStatus.PENDING
    receipt_number: Optional[str] = None
    remarks: Optional[str] = None

class FeePaymentCreate(FeePaymentBase):
    pass

class FeePayment(FeePaymentBase):
    id: int
    payment_date: Optional[datetime]
    status: PaymentStatus
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
