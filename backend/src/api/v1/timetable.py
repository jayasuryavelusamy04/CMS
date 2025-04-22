from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import datetime, date
from ...core.deps import get_db, get_current_user
from ...models.staff import Staff
from ...models.student import Student
from ...crud.timetable import period, timetable_slot, attendance, timetable_config
from ...schemas.timetable import (
    Period, PeriodCreate, PeriodUpdate, PeriodList,
    TimetableSlot, TimetableSlotCreate, TimetableSlotUpdate, TimetableSlotList,
    Attendance, AttendanceCreate, AttendanceUpdate, AttendanceList,
    TimetableConfig, TimetableConfigCreate, TimetableConfigList,
    AttendanceReport, AttendanceReportParams
)

router = APIRouter()

# Period Management
@router.post("/periods/", response_model=Period)
def create_period(
    *,
    db: Session = Depends(get_db),
    period_in: PeriodCreate,
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check for period overlap
    if period.check_period_overlap(
        db,
        period_in.class_section_id,
        period_in.day_of_week,
        period_in.start_time,
        period_in.end_time
    ):
        raise HTTPException(status_code=400, detail="Period overlaps with existing period")
    
    return period.create(db=db, obj_in=period_in)

@router.get("/periods/", response_model=PeriodList)
def get_periods(
    class_section_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    periods = period.get_by_class_section(db, class_section_id)
    return {"total": len(periods), "items": periods}

# Timetable Slot Management
@router.post("/slots/", response_model=TimetableSlot)
def create_timetable_slot(
    *,
    db: Session = Depends(get_db),
    slot_in: TimetableSlotCreate,
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check for teacher conflict
    if timetable_slot.check_teacher_conflict(db, slot_in.teacher_id, slot_in.period_id):
        raise HTTPException(
            status_code=400,
            detail="Teacher is already assigned to another class during this period"
        )
    
    return timetable_slot.create(db=db, obj_in=slot_in)

@router.get("/slots/", response_model=TimetableSlotList)
def get_timetable_slots(
    class_section_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    slots = timetable_slot.get_by_class_section(db, class_section_id)
    return {"total": len(slots), "items": slots}

# Attendance Management
@router.post("/attendance/", response_model=Attendance)
def create_attendance(
    *,
    db: Session = Depends(get_db),
    attendance_in: AttendanceCreate,
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or (current_user.role.value != "teacher" and current_user.role.value != "admin"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return attendance.create(db=db, obj_in=attendance_in)

@router.get("/attendance/", response_model=AttendanceList)
def get_attendance(
    student_id: Optional[int] = None,
    class_section_id: Optional[int] = None,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    attendance_records = attendance.get_student_attendance(
        db,
        student_id=student_id,
        start_date=datetime.combine(start_date, datetime.min.time()),
        end_date=datetime.combine(end_date, datetime.max.time())
    )
    return {"total": len(attendance_records), "items": attendance_records}

@router.post("/attendance/report/", response_model=List[AttendanceReport])
def generate_attendance_report(
    *,
    db: Session = Depends(get_db),
    params: AttendanceReportParams,
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or (current_user.role.value != "teacher" and current_user.role.value != "admin"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return attendance.generate_report(db=db, params=params)

# Timetable Configuration
@router.post("/config/", response_model=TimetableConfig)
def create_timetable_config(
    *,
    db: Session = Depends(get_db),
    config_in: TimetableConfigCreate,
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return timetable_config.create(db=db, obj_in=config_in)

@router.get("/config/", response_model=TimetableConfigList)
def get_timetable_configs(
    class_section_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    configs = timetable_config.get_by_class_section(db, class_section_id)
    return {"total": len(configs), "items": configs}

# Bulk Operations
@router.post("/attendance/bulk/", response_model=List[Attendance])
async def create_bulk_attendance(
    *,
    db: Session = Depends(get_db),
    attendances: List[AttendanceCreate],
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or (current_user.role.value != "teacher" and current_user.role.value != "admin"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = []
    for attendance_in in attendances:
        result.append(attendance.create(db=db, obj_in=attendance_in))
    return result

@router.get("/timetable/validate/", response_model=dict)
async def validate_timetable(
    class_section_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Union[Student, Staff] = Depends(get_current_user)
):
    if not isinstance(current_user, Staff) or current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Implement validation logic here
    # Check for:
    # 1. Missing periods
    # 2. Teacher conflicts
    # 3. Room conflicts
    # 4. Coverage of all subjects
    
    return {
        "is_valid": True,
        "warnings": [],
        "errors": []
    }
