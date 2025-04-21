from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from src.core.config import settings
from src.core.database import SessionLocal
from src.crud.auth import auth_crud
from src.schemas.auth import TokenPayload
from src.models.student import Student
from src.models.staff import Staff

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> Optional[Student | Staff]:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = None
    role = payload.get("role")
    if role == "student":
        user = db.query(Student).filter(Student.id == token_data.sub).first()
    elif role in ["teacher", "admin", "accountant", "librarian"]:
        user = db.query(Staff).filter(Staff.id == token_data.sub).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: Student | Staff = Depends(get_current_user),
) -> Student | Staff:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_staff(
    current_user: Staff = Depends(get_current_user),
) -> Staff:
    if not isinstance(current_user, Staff):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_active_admin(
    current_user: Staff = Depends(get_current_active_staff),
) -> Staff:
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges"
        )
    return current_user
