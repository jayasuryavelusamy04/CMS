from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from datetime import datetime, date

from core.deps import get_db, get_current_user
from schemas.attendance import (
    StudentAttendance,
    StudentAttendanceCreate,
    QRCodeAttendance,
    QRCodeAttendanceCreate,
    GeolocationAttendance,
    GeolocationAttendanceCreate,
    OfflineAttendanceSync,
    OfflineAttendanceSyncCreate,
    AttendanceNotification,
    AttendanceNotificationCreate,
    StudentAttendanceSummary,
    ClassAttendanceSummary,
    SubjectAttendanceReport
)
import crud.attendance as crud

router = APIRouter()

# Student Attendance
@router.post("/", response_model=StudentAttendance)
async def create_attendance(
    attendance: StudentAttendanceCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new attendance record with audit logging"""
    return crud.create_attendance(
        db=db,
        attendance=attendance,
        user_id=current_user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", "")
    )

@router.get("/student/{student_id}", response_model=List[StudentAttendance])
def get_student_attendance(
    student_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get attendance records for a specific student"""
    return crud.get_student_attendance(db, student_id, start_date, end_date, subject_id)

@router.put("/{attendance_id}", response_model=StudentAttendance)
async def update_attendance(
    attendance_id: int,
    new_status: str,
    reason: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update attendance status with audit logging"""
    return crud.update_attendance(
        db=db,
        attendance_id=attendance_id,
        new_status=new_status,
        user_id=current_user.id,
        reason=reason,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", "")
    )

# QR Code Attendance
@router.post("/qr", response_model=QRCodeAttendance)
def create_qr_attendance(
    qr_data: QRCodeAttendanceCreate,
    db: Session = Depends(get_db)
):
    """Create QR code based attendance record"""
    return crud.create_qr_attendance(db, qr_data)

@router.get("/qr/verify/{qr_code}", response_model=QRCodeAttendance)
def verify_qr_attendance(
    qr_code: str,
    db: Session = Depends(get_db)
):
    """Verify QR code for attendance"""
    result = crud.verify_qr_code(db, qr_code)
    if not result:
        raise HTTPException(status_code=404, detail="Invalid or expired QR code")
    return result

# Geolocation Attendance
@router.post("/geolocation", response_model=GeolocationAttendance)
def create_geolocation_attendance(
    geo_data: GeolocationAttendanceCreate,
    db: Session = Depends(get_db)
):
    """Create geolocation based attendance record"""
    # TODO: Get school coordinates from configuration
    school_coordinates = {"latitude": 0.0, "longitude": 0.0}
    allowed_radius = 100  # meters
    
    return crud.create_geolocation_attendance(
        db, geo_data, school_coordinates, allowed_radius
    )

# Offline Sync
@router.post("/sync", response_model=OfflineAttendanceSync)
async def create_sync_request(
    sync_data: OfflineAttendanceSyncCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create offline attendance sync request"""
    sync = crud.create_offline_sync(db, sync_data)
    
    # Process sync asynchronously
    success = crud.process_offline_sync(
        db,
        sync.sync_id,
        current_user.id,
        request.client.host,
        request.headers.get("user-agent", "")
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to process offline attendance records"
        )
    
    return sync

# Attendance Analytics
@router.get("/summary/student/{student_id}", response_model=StudentAttendanceSummary)
def get_student_attendance_summary(
    student_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get attendance summary for a student"""
    return crud.get_attendance_summary(db, student_id, start_date, end_date)

@router.get("/summary/class/{class_section_id}", response_model=ClassAttendanceSummary)
def get_class_attendance_summary(
    class_section_id: int,
    date: Optional[date] = None,
    period_number: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get attendance summary for a class"""
    # TODO: Implement class attendance summary in CRUD
    ...

@router.get("/summary/subject/{subject_id}", response_model=SubjectAttendanceReport)
def get_subject_attendance_report(
    subject_id: int,
    class_section_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get attendance report for a subject"""
    # TODO: Implement subject attendance report in CRUD
    ...

# Notifications
@router.post("/notifications", response_model=AttendanceNotification)
def create_notification(
    notification: AttendanceNotificationCreate,
    db: Session = Depends(get_db)
):
    """Create attendance notification"""
    return crud.create_attendance_notification(db, notification)

@router.put("/notifications/{notification_id}/status", response_model=AttendanceNotification)
def update_notification_status(
    notification_id: int,
    status: str,
    error_message: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update notification status"""
    result = crud.update_notification_status(db, notification_id, status, error_message)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result
