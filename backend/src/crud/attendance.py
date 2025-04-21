from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, date
import uuid

from models.attendance import (
    StudentAttendance,
    AttendanceAuditLog,
    QRCodeAttendance,
    GeolocationAttendance,
    OfflineAttendanceSync,
    AttendanceNotification,
    AttendanceStatus
)
from schemas.attendance import (
    StudentAttendanceCreate,
    OfflineAttendanceRecord,
    OfflineAttendanceSyncCreate,
    GeolocationAttendanceCreate,
    QRCodeAttendanceCreate,
    AttendanceNotificationCreate
)

# Student Attendance
def create_attendance(
    db: Session, attendance: StudentAttendanceCreate, user_id: int, 
    ip_address: str, user_agent: str
) -> StudentAttendance:
    db_attendance = StudentAttendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)

    # Create audit log
    audit_log = AttendanceAuditLog(
        attendance_id=db_attendance.id,
        modified_by=user_id,
        old_status=None,
        new_status=attendance.status,
        action="CREATE",
        reason="Initial attendance marking",
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit_log)
    db.commit()

    return db_attendance

def get_student_attendance(
    db: Session,
    student_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    subject_id: Optional[int] = None
) -> List[StudentAttendance]:
    query = db.query(StudentAttendance).filter(
        StudentAttendance.student_id == student_id
    )
    
    if start_date:
        query = query.filter(StudentAttendance.date >= start_date)
    if end_date:
        query = query.filter(StudentAttendance.date <= end_date)
    if subject_id:
        query = query.filter(StudentAttendance.subject_id == subject_id)
        
    return query.order_by(StudentAttendance.date, StudentAttendance.period_number).all()

def update_attendance(
    db: Session,
    attendance_id: int,
    new_status: AttendanceStatus,
    user_id: int,
    reason: str,
    ip_address: str,
    user_agent: str
) -> Optional[StudentAttendance]:
    db_attendance = db.query(StudentAttendance).filter(
        StudentAttendance.id == attendance_id
    ).first()
    
    if db_attendance:
        old_status = db_attendance.status
        db_attendance.status = new_status
        db_attendance.updated_at = datetime.utcnow()
        
        # Create audit log
        audit_log = AttendanceAuditLog(
            attendance_id=attendance_id,
            modified_by=user_id,
            old_status=old_status,
            new_status=new_status,
            action="UPDATE",
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(audit_log)
        db.commit()
        db.refresh(db_attendance)
        
    return db_attendance

# QR Code Attendance
def create_qr_attendance(
    db: Session, qr_data: QRCodeAttendanceCreate
) -> QRCodeAttendance:
    db_qr = QRCodeAttendance(
        **qr_data.dict(),
        scanned_at=datetime.utcnow()
    )
    db.add(db_qr)
    db.commit()
    db.refresh(db_qr)
    return db_qr

def verify_qr_code(
    db: Session, qr_code: str
) -> Optional[QRCodeAttendance]:
    return db.query(QRCodeAttendance).filter(
        QRCodeAttendance.qr_code == qr_code,
        QRCodeAttendance.is_valid == True
    ).first()

# Geolocation Attendance
def create_geolocation_attendance(
    db: Session,
    geo_data: GeolocationAttendanceCreate,
    school_coordinates: Dict[str, float],
    allowed_radius: float
) -> GeolocationAttendance:
    # Calculate if location is within allowed bounds
    # This is a simplified check - in production you'd want to use proper
    # geospatial calculations
    is_within_bounds = True  # Implement proper calculation here
    
    db_geo = GeolocationAttendance(
        **geo_data.dict(),
        is_within_bounds=is_within_bounds
    )
    db.add(db_geo)
    db.commit()
    db.refresh(db_geo)
    return db_geo

# Offline Sync
def create_offline_sync(
    db: Session, sync_data: OfflineAttendanceSyncCreate
) -> OfflineAttendanceSync:
    sync_id = str(uuid.uuid4())
    db_sync = OfflineAttendanceSync(
        sync_id=sync_id,
        **sync_data.dict(),
        sync_status="PENDING"
    )
    db.add(db_sync)
    db.commit()
    db.refresh(db_sync)
    return db_sync

def process_offline_sync(
    db: Session,
    sync_id: str,
    user_id: int,
    ip_address: str,
    user_agent: str
) -> bool:
    db_sync = db.query(OfflineAttendanceSync).filter(
        OfflineAttendanceSync.sync_id == sync_id,
        OfflineAttendanceSync.sync_status == "PENDING"
    ).first()
    
    if not db_sync:
        return False
    
    try:
        for record in db_sync.sync_data:
            attendance = StudentAttendanceCreate(**record)
            create_attendance(db, attendance, user_id, ip_address, user_agent)
        
        db_sync.sync_status = "SYNCED"
        db_sync.synced_at = datetime.utcnow()
        db.commit()
        return True
        
    except Exception as e:
        db_sync.sync_status = "FAILED"
        db_sync.error_details = {"error": str(e)}
        db.commit()
        return False

# Attendance Analytics
def get_attendance_summary(
    db: Session,
    student_id: int,
    start_date: date,
    end_date: date
) -> Dict[str, Any]:
    attendance_records = db.query(StudentAttendance).filter(
        StudentAttendance.student_id == student_id,
        StudentAttendance.date.between(start_date, end_date)
    ).all()
    
    total_classes = len(attendance_records)
    present_count = sum(1 for a in attendance_records if a.status == AttendanceStatus.PRESENT)
    absent_count = sum(1 for a in attendance_records if a.status == AttendanceStatus.ABSENT)
    late_count = sum(1 for a in attendance_records if a.status == AttendanceStatus.LATE)
    leave_count = sum(1 for a in attendance_records if a.status == AttendanceStatus.ON_LEAVE)
    
    return {
        "total_classes": total_classes,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "leave_count": leave_count,
        "attendance_percentage": (present_count / total_classes * 100) if total_classes > 0 else 0
    }

# Notifications
def create_attendance_notification(
    db: Session, notification: AttendanceNotificationCreate
) -> AttendanceNotification:
    db_notification = AttendanceNotification(
        **notification.dict(),
        status="PENDING"
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def update_notification_status(
    db: Session,
    notification_id: int,
    status: str,
    error_message: Optional[str] = None
) -> Optional[AttendanceNotification]:
    db_notification = db.query(AttendanceNotification).filter(
        AttendanceNotification.id == notification_id
    ).first()
    
    if db_notification:
        db_notification.status = status
        db_notification.error_message = error_message
        db_notification.sent_at = datetime.utcnow() if status == "SENT" else None
        db.commit()
        db.refresh(db_notification)
        
    return db_notification
