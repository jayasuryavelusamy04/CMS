from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from core.deps import get_db, get_current_user
from schemas.student import StudentCreate, StudentResponse, StudentList, StudentUpdate
from schemas.student_document import StudentDocumentCreate, StudentDocumentResponse
from crud.student import student
from models.student import AdmissionStatus
import json

router = APIRouter()

@router.post("/students/", response_model=StudentResponse)
def create_student(
    *,
    db: Session = Depends(get_db),
    student_in: StudentCreate,
    _: dict = Depends(get_current_user)
):
    """Create new student admission"""
    return student.create_with_guardians(db=db, obj_in=student_in)

@router.get("/students/", response_model=StudentList)
def list_students(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    admission_status: Optional[AdmissionStatus] = None,
    search: Optional[str] = None,
    _: dict = Depends(get_current_user)
):
    """Get list of students with optional filters"""
    students = student.get_multi_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        admission_status=admission_status,
        search=search
    )
    total = student.get_total_count(
        db=db,
        admission_status=admission_status,
        search=search
    )
    return {"total": total, "items": students}

@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
    _: dict = Depends(get_current_user)
):
    """Get student by ID"""
    db_student = student.get(db=db, id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
    student_in: StudentUpdate,
    _: dict = Depends(get_current_user)
):
    """Update student details"""
    db_student = student.get(db=db, id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student.update(db=db, db_obj=db_student, obj_in=student_in)

@router.delete("/students/{student_id}")
def delete_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
    _: dict = Depends(get_current_user)
):
    """Delete student"""
    db_student = student.get(db=db, id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.remove(db=db, id=student_id)
    return {"success": True}
