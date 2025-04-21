from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
from ..models.fee import FeeStructure, FeeComponent, StudentFee, FeePayment, PaymentStatus
from ..schemas.fee import FeeStructureCreate, FeeStructureUpdate, FeeComponentCreate, StudentFeeCreate, FeePaymentCreate

class FeeCRUD:
    @staticmethod
    async def create_fee_structure(db: Session, fee_structure: FeeStructureCreate) -> FeeStructure:
        db_fee_structure = FeeStructure(
            name=fee_structure.name,
            class_id=fee_structure.class_id,
            amount=fee_structure.amount,
            frequency=fee_structure.frequency,
            due_day=fee_structure.due_day,
            is_active=fee_structure.is_active
        )
        db.add(db_fee_structure)
        db.flush()

        # Create fee components
        for component in fee_structure.components:
            db_component = FeeComponent(
                fee_structure_id=db_fee_structure.id,
                name=component.name,
                amount=component.amount,
                is_mandatory=component.is_mandatory,
                description=component.description
            )
            db.add(db_component)

        db.commit()
        db.refresh(db_fee_structure)
        return db_fee_structure

    @staticmethod
    async def get_fee_structures(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        class_id: Optional[int] = None
    ) -> List[FeeStructure]:
        query = db.query(FeeStructure)
        if class_id:
            query = query.filter(FeeStructure.class_id == class_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    async def get_fee_structure(db: Session, fee_structure_id: int) -> Optional[FeeStructure]:
        return db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()

    @staticmethod
    async def update_fee_structure(
        db: Session,
        fee_structure_id: int,
        fee_structure: FeeStructureUpdate
    ) -> Optional[FeeStructure]:
        db_fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()
        if db_fee_structure:
            for key, value in fee_structure.dict(exclude_unset=True).items():
                setattr(db_fee_structure, key, value)
            db.commit()
            db.refresh(db_fee_structure)
        return db_fee_structure

    @staticmethod
    async def create_student_fee(db: Session, student_fee: StudentFeeCreate) -> StudentFee:
        db_student_fee = StudentFee(**student_fee.dict())
        db.add(db_student_fee)
        db.commit()
        db.refresh(db_student_fee)
        return db_student_fee

    @staticmethod
    async def get_student_fees(
        db: Session,
        student_id: int,
        academic_year: Optional[str] = None
    ) -> List[StudentFee]:
        query = db.query(StudentFee).filter(StudentFee.student_id == student_id)
        if academic_year:
            query = query.filter(StudentFee.academic_year == academic_year)
        return query.all()

    @staticmethod
    async def record_payment(db: Session, payment: FeePaymentCreate) -> FeePayment:
        db_payment = FeePayment(**payment.dict())
        db.add(db_payment)

        # Update student fee status
        student_fee = db.query(StudentFee).filter(StudentFee.id == payment.student_fee_id).first()
        if student_fee:
            student_fee.paid_amount += payment.amount
            if student_fee.paid_amount >= student_fee.total_amount:
                student_fee.status = PaymentStatus.PAID
            elif student_fee.paid_amount > 0:
                student_fee.status = PaymentStatus.PARTIAL

        db.commit()
        db.refresh(db_payment)
        return db_payment

    @staticmethod
    async def get_payment_history(
        db: Session,
        student_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[FeePayment]:
        query = db.query(FeePayment).join(StudentFee).filter(StudentFee.student_id == student_id)
        
        if start_date and end_date:
            query = query.filter(and_(
                FeePayment.payment_date >= start_date,
                FeePayment.payment_date <= end_date
            ))
        
        return query.order_by(FeePayment.payment_date.desc()).all()

    @staticmethod
    async def get_overdue_fees(db: Session) -> List[StudentFee]:
        return db.query(StudentFee).filter(
            and_(
                StudentFee.status.in_([PaymentStatus.PENDING, PaymentStatus.PARTIAL]),
                StudentFee.due_date < datetime.now()
            )
        ).all()
