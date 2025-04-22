from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ...core.deps import get_db, get_current_user
from ...crud.student_profile import student_profile
from ...schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentProfileList,
    AttendanceCreate,
    AttendanceResponse,
    AttendanceList,
    MarkCreate,
    MarkResponse,
    MarkList
)

router = APIRouter()

@router.post("/profiles/", response_model=StudentProfileResponse)
def create_student_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: StudentProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new student profile"""
    return student_profile.create(db=db, obj_in=profile_in)

@router.get("/profiles/", response_model=StudentProfileList)
def list_student_profiles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    academic_year: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get list of student profiles"""
    profiles = student_profile.get_active_profiles(
        db=db,
        skip=skip,
        limit=limit,
        academic_year=academic_year
    )
    total = len(profiles)  # For simplicity, you might want to add a count query
    return {"total": total, "items": profiles}

@router.get("/profiles/{profile_id}", response_model=StudentProfileResponse)
def get_student_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student profile by ID"""
    db_profile = student_profile.get(db=db, id=profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db_profile

@router.put("/profiles/{profile_id}", response_model=StudentProfileResponse)
def update_student_profile(
    *,
    db: Session = Depends(get_db),
    profile_id: int,
    profile_in: StudentProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update student profile"""
    db_profile = student_profile.get(db=db, id=profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_profile.update(db=db, db_obj=db_profile, obj_in=profile_in)

@router.post("/attendance/", response_model=AttendanceResponse)
def create_attendance(
    *,
    db: Session = Depends(get_db),
    attendance_in: AttendanceCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create attendance record"""
    try:
        return student_profile.create_attendance(db=db, obj_in=attendance_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profiles/{profile_id}/attendance/", response_model=AttendanceList)
def get_student_attendance(
    profile_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student attendance by date range"""
    attendances = student_profile.get_attendance_by_date_range(
        db=db,
        student_profile_id=profile_id,
        start_date=start_date,
        end_date=end_date
    )
    return {"total": len(attendances), "items": attendances}

@router.post("/marks/", response_model=MarkResponse)
def create_mark(
    *,
    db: Session = Depends(get_db),
    mark_in: MarkCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create mark record"""
    try:
        return student_profile.create_mark(db=db, obj_in=mark_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profiles/{profile_id}/marks/{subject_id}", response_model=MarkList)
def get_student_marks(
    profile_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student marks by subject"""
    marks = student_profile.get_marks_by_subject(
        db=db,
        student_profile_id=profile_id,
        subject_id=subject_id
    )
    return {"total": len(marks), "items": marks}

@router.get("/profiles/{profile_id}/attendance-percentage/")
def get_attendance_percentage(
    profile_id: int,
    subject_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student attendance percentage"""
    percentage = student_profile.calculate_attendance_percentage(
        db=db,
        student_profile_id=profile_id,
        subject_id=subject_id,
        start_date=start_date,
        end_date=end_date
    )
    return {"attendance_percentage": percentage}

@router.get("/profiles/{profile_id}/subject-average/{subject_id}")
def get_subject_average(
    profile_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get student's average marks in a subject"""
    average = student_profile.calculate_subject_average(
        db=db,
        student_profile_id=profile_id,
        subject_id=subject_id
    )
    return {"subject_average": average}
