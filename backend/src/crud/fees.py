from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from datetime import datetime

from models.fees import FeeStructure, FeePayment
from schemas.fees import FeeStructureCreate, FeePaymentCreate

def create_fee_structure(db: Session, fee_structure: FeeStructureCreate) -> FeeStructure:
    db_fee_structure = FeeStructure(**fee_structure.dict())
    db.add(db_fee_structure)
    db.commit()
    db.refresh(db_fee_structure)
    return db_fee_structure

def get_fee_structures(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    class_section_id: Optional[int] = None
) -> List[FeeStructure]:
    query = db.query(FeeStructure)
    if class_section_id:
        query = query.filter(FeeStructure.class_section_id == class_section_id)
    return query.offset(skip).limit(limit).all()

def get_fee_structure(db: Session, fee_structure_id: int) -> Optional[FeeStructure]:
    return db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()

def update_fee_structure(
    db: Session, 
    fee_structure_id: int, 
    fee_structure_data: dict
) -> Optional[FeeStructure]:
    db_fee_structure = get_fee_structure(db, fee_structure_id)
    if db_fee_structure:
        obj_data = jsonable_encoder(db_fee_structure)
        for field in obj_data:
            if field in fee_structure_data:
                setattr(db_fee_structure, field, fee_structure_data[field])
        db.add(db_fee_structure)
        db.commit()
        db.refresh(db_fee_structure)
    return db_fee_structure

def create_fee_payment(db: Session, fee_payment: FeePaymentCreate) -> FeePayment:
    db_fee_payment = FeePayment(
        **fee_payment.dict(),
        payment_date=datetime.utcnow(),
        payment_status="SUCCESS"
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
    
    total_fees = sum(payment.fee_structure.amount for payment in student_payments)
    total_paid = sum(payment.amount_paid for payment in student_payments)
    
    return {
        "student_id": student_id,
        "total_fees": total_fees,
        "total_paid": total_paid,
        "total_pending": total_fees - total_paid,
        "fee_payments": student_payments
    }

def get_class_fees_summary(db: Session, class_section_id: int) -> List[dict]:
    fee_structures = (
        db.query(FeeStructure)
        .filter(FeeStructure.class_section_id == class_section_id)
        .all()
    )
    
    summaries = []
    for structure in fee_structures:
        payments = db.query(FeePayment).filter(FeePayment.fee_structure_id == structure.id).all()
        total_paid = sum(payment.amount_paid for payment in payments)
        
        summaries.append({
            "fee_type": structure.fee_type,
            "total_amount": structure.amount,
            "total_paid": total_paid,
            "total_pending": structure.amount - total_paid,
            "due_date": structure.due_date
        })
    
    return summaries
