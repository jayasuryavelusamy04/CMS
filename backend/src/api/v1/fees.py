from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from core.deps import get_db
from crud import fees as fees_crud
from schemas.fees import (
    FeeStructure,
    FeeStructureCreate,
    FeePayment,
    FeePaymentCreate,
    StudentFeesSummary
)

router = APIRouter()

@router.post("/fee-structures/", response_model=FeeStructure)
def create_fee_structure(
    fee_structure: FeeStructureCreate,
    db: Session = Depends(get_db)
):
    """Create a new fee structure for a class"""
    return fees_crud.create_fee_structure(db=db, fee_structure=fee_structure)

@router.get("/fee-structures/", response_model=List[FeeStructure])
def get_fee_structures(
    class_section_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    """Get all fee structures with optional filtering by class section"""
    return fees_crud.get_fee_structures(
        db=db, 
        skip=skip, 
        limit=limit, 
        class_section_id=class_section_id
    )

@router.get("/fee-structures/{fee_structure_id}", response_model=FeeStructure)
def get_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific fee structure by ID"""
    fee_structure = fees_crud.get_fee_structure(db=db, fee_structure_id=fee_structure_id)
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    return fee_structure

@router.put("/fee-structures/{fee_structure_id}", response_model=FeeStructure)
def update_fee_structure(
    fee_structure_id: int,
    fee_structure_data: dict,
    db: Session = Depends(get_db)
):
    """Update a fee structure"""
    fee_structure = fees_crud.update_fee_structure(
        db=db, 
        fee_structure_id=fee_structure_id,
        fee_structure_data=fee_structure_data
    )
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    return fee_structure

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

@router.get("/class-sections/{class_section_id}/summary")
def get_class_fees_summary(
    class_section_id: int,
    db: Session = Depends(get_db)
):
    """Get fee summary for an entire class section"""
    return fees_crud.get_class_fees_summary(db=db, class_section_id=class_section_id)
