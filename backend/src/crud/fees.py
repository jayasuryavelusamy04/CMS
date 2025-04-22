from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from datetime import datetime

from ..models.fees import FeePayment, PaymentStatus
from ..schemas.fees import FeePaymentCreate

def create_fee_payment(db: Session, fee_payment: FeePaymentCreate) -> FeePayment:
    db_fee_payment = FeePayment(
        **fee_payment.dict(),
        payment_date=datetime.utcnow(),
        status=PaymentStatus.PAID
    )
    db.add(db_fee_payment)
    db.commit()
    db.refresh(db_fee_payment)
    return db_fee_payment

def get_student_fee_payments(
    db: Session, 
    student_id: int,
    skip: int = 0, 
    limit: int = 100
) -> List[FeePayment]:
    return (
        db.query(FeePayment)
        .filter(FeePayment.student_id == student_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_student_fees_summary(db: Session, student_id: int) -> dict:
    # Get all fee structures applicable to student's class
    student_payments = db.query(FeePayment).filter(FeePayment.student_id == student_id).all()
    
    total_fees = sum(payment.amount for payment in student_payments)
    total_paid = sum(payment.paid_amount for payment in student_payments)
    
    return {
        "student_id": student_id,
        "total_fees": total_fees,
        "total_paid": total_paid,
        "total_pending": total_fees - total_paid,
        "fee_payments": student_payments
    }

def get_class_fees_summary(db: Session, student_ids: List[int]) -> List[dict]:
    """Get fee summary for a group of students"""
    summaries = []
    
    for student_id in student_ids:
        payments = (
            db.query(FeePayment)
            .filter(FeePayment.student_id == student_id)
            .all()
        )
        
        if payments:
            total_amount = sum(payment.amount for payment in payments)
            total_paid = sum(payment.paid_amount for payment in payments)
            # Get the earliest due date from all payments
            earliest_due = min(payment.due_date for payment in payments)
            
            summaries.append({
                "student_id": student_id,
                "total_amount": total_amount,
                "total_paid": total_paid,
                "total_pending": total_amount - total_paid,
                "next_due_date": earliest_due
            })
    
    return summaries
