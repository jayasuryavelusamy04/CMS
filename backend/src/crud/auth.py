from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime

from src.models.student import Student
from src.models.staff import Staff
from src.schemas.auth import UserCreate, UserUpdate
from src.core.security import get_password_hash, verify_password

class CRUDAuth:
    def authenticate(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        role: str = None
    ) -> Optional[Student | Staff]:
        if role == "student":
            user = db.query(Student).filter(Student.email == email).first()
        elif role == "staff":
            user = db.query(Staff).filter(Staff.email == email).first()
        else:
            # If role not specified, check both tables
            user = (
                db.query(Student).filter(Student.email == email).first() or
                db.query(Staff).filter(Staff.email == email).first()
            )
        
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def change_password(
        self,
        db: Session,
        *,
        user: Student | Staff,
        new_password: str
    ) -> Student | Staff:
        hashed_password = get_password_hash(new_password)
        user.hashed_password = hashed_password
        user.updated_at = datetime.utcnow()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

auth_crud = CRUDAuth()
