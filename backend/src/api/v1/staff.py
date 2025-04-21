from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.deps import get_db, get_current_user
from src.crud.staff import staff
from src.schemas.staff import (
    StaffCreate,
    StaffUpdate,
    StaffResponse,
    StaffList,
    TeacherSubjectCreate,
    TeacherSubjectResponse,
    StaffAvailabilityCreate,
    StaffAvailabilityResponse,
    StaffAuditLogResponse
)

router = APIRouter()

@router.post("/", response_model=StaffResponse)
def create_staff(
    *,
    db: Session = Depends(get_db),
    staff_in: StaffCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new staff member"""
    return staff.create_with_audit(db=db, obj_in=staff_in, performed_by=current_user["id"])

@router.get("/", response_model=StaffList)
def list_staff(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    role: Optional[str] = None,
    is_active: Optional[bool] = True,
    current_user: dict = Depends(get_current_user)
):
    """Get list of staff members"""
    filters = {}
    if role:
        filters["role"] = role
    if is_active is not None:
        filters["is_active"] = is_active

    staff_members = staff.get_multi(db, skip=skip, limit=limit, filters=filters)
    total = len(staff_members)  # For simplicity; in production, use count query
    return {"total": total, "items": staff_members}

@router.get("/{staff_id}", response_model=StaffResponse)
def get_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get staff member by ID"""
    db_staff = staff.get(db=db, id=staff_id)
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return db_staff

@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(
    *,
    db: Session = Depends(get_db),
    staff_id: int,
    staff_in: StaffUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update staff member"""
    db_staff = staff.get(db=db, id=staff_id)
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff.update_with_audit(
        db=db,
        db_obj=db_staff,
        obj_in=staff_in,
        performed_by=current_user["id"]
    )

@router.delete("/{staff_id}", response_model=StaffResponse)
def delete_staff(
    *,
    db: Session = Depends(get_db),
    staff_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete staff member"""
    db_staff = staff.delete_with_audit(
        db=db,
        id=staff_id,
        performed_by=current_user["id"]
    )
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return db_staff

@router.post("/teacher-subjects/", response_model=TeacherSubjectResponse)
def assign_subject(
    *,
    db: Session = Depends(get_db),
    subject_in: TeacherSubjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Assign subject to teacher"""
    return staff.assign_subject(db=db, obj_in=subject_in)

@router.get("/teacher/{teacher_id}/subjects", response_model=List[TeacherSubjectResponse])
def get_teacher_subjects(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get subjects assigned to teacher"""
    return staff.get_teacher_subjects(db=db, teacher_id=teacher_id)

@router.post("/availability/", response_model=StaffAvailabilityResponse)
def set_availability(
    *,
    db: Session = Depends(get_db),
    availability_in: StaffAvailabilityCreate,
    current_user: dict = Depends(get_current_user)
):
    """Set staff availability"""
    # Check for conflicts
    has_conflict = staff.check_availability_conflict(
        db=db,
        staff_id=availability_in.staff_id,
        day_of_week=availability_in.day_of_week,
        start_time=availability_in.start_time,
        end_time=availability_in.end_time
    )
    if has_conflict:
        raise HTTPException(
            status_code=400,
            detail="Time slot conflicts with existing availability"
        )
    return staff.set_availability(db=db, obj_in=availability_in)

@router.get("/staff/{staff_id}/availability", response_model=List[StaffAvailabilityResponse])
def get_staff_availability(
    staff_id: int,
    day_of_week: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get staff availability"""
    return staff.get_availability(db=db, staff_id=staff_id, day_of_week=day_of_week)

@router.get("/staff/{staff_id}/audit-logs", response_model=List[StaffAuditLogResponse])
def get_staff_audit_logs(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get staff audit logs"""
    return staff.get_audit_logs(db=db, staff_id=staff_id)
