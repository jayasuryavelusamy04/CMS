from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ...core.deps import get_db
from ...crud import fees as fees_crud
from ...schemas.fees import (
    FeePayment,
    FeePaymentCreate,
    StudentFeesSummary
)

router = APIRouter()

@router.post("/payments/", response_model=FeePayment)
def create_fee_payment(
    payment: FeePaymentCreate,
    db: Session = Depends(get_db)
):
    """Create a new fee payment"""
    return fees_crud.create_fee_payment(db=db, fee_payment=payment)

@router.get("/students/{student_id}/payments", response_model=List[FeePayment])
def get_student_fee_payments(
    student_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    """Get all fee payments for a specific student"""
    return fees_crud.get_student_fee_payments(
        db=db, 
        student_id=student_id,
        skip=skip,
        limit=limit
    )

@router.get("/students/{student_id}/summary", response_model=StudentFeesSummary)
def get_student_fees_summary(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get fee payment summary for a specific student"""
    return fees_crud.get_student_fees_summary(db=db, student_id=student_id)

@router.get("/class-sections/summary")
def get_class_fees_summary(
    student_ids: List[int],
    db: Session = Depends(get_db)
):
    """Get fee summary for a group of students"""
    return fees_crud.get_class_fees_summary(db=db, student_ids=student_ids)
