from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from ..models.attendance import AttendanceStatus, AttendanceMarkingMethod

class StudentAttendanceBase(BaseModel):
    student_id: int
    class_section_id: int
    subject_id: int
    teacher_id: int
    date: datetime
    period_number: int
    status: AttendanceStatus
    marking_method: AttendanceMarkingMethod
    remarks: Optional[str] = None
    sync_id: Optional[str] = None

class StudentAttendanceCreate(StudentAttendanceBase):
    pass

class StudentAttendance(StudentAttendanceBase):
    id: int
    marked_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AttendanceAuditLogBase(BaseModel):
    attendance_id: int
    modified_by: int
    old_status: AttendanceStatus
    new_status: AttendanceStatus
    action: str
    reason: str
    ip_address: str
    user_agent: str

class AttendanceAuditLogCreate(AttendanceAuditLogBase):
    pass

class AttendanceAuditLog(AttendanceAuditLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QRCodeAttendanceBase(BaseModel):
    attendance_id: int
    qr_code: str
    device_info: Dict[str, Any]

class QRCodeAttendanceCreate(QRCodeAttendanceBase):
    pass

class QRCodeAttendance(QRCodeAttendanceBase):
    id: int
    scanned_at: datetime
    is_valid: bool
    created_at: datetime

    class Config:
        from_attributes = True

class GeolocationAttendanceBase(BaseModel):
    attendance_id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: float
    device_info: Dict[str, Any]

    @validator('accuracy')
    def validate_accuracy(cls, v):
        if v < 0:
            raise ValueError('Accuracy must be positive')
        return v

class GeolocationAttendanceCreate(GeolocationAttendanceBase):
    pass

class GeolocationAttendance(GeolocationAttendanceBase):
    id: int
    is_within_bounds: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OfflineAttendanceRecord(BaseModel):
    student_id: int
    class_section_id: int
    subject_id: int
    teacher_id: int
    date: datetime
    period_number: int
    status: AttendanceStatus
    marking_method: AttendanceMarkingMethod
    device_timestamp: datetime
    local_id: str

class OfflineAttendanceSyncBase(BaseModel):
    device_id: str
    sync_data: List[OfflineAttendanceRecord]

class OfflineAttendanceSyncCreate(OfflineAttendanceSyncBase):
    pass

class OfflineAttendanceSync(OfflineAttendanceSyncBase):
    id: int
    sync_id: str
    sync_status: str
    synced_at: Optional[datetime]
    error_details: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AttendanceNotificationBase(BaseModel):
    student_id: int
    attendance_id: int
    notification_type: str
    content: str

class AttendanceNotificationCreate(AttendanceNotificationBase):
    pass

class AttendanceNotification(AttendanceNotificationBase):
    id: int
    status: str
    error_message: Optional[str]
    sent_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Response Schemas for aggregated data
class StudentAttendanceSummary(BaseModel):
    student_id: int
    total_classes: int
    present_count: int
    absent_count: int
    late_count: int
    leave_count: int
    attendance_percentage: float
    subject_wise_attendance: Dict[str, Dict[str, Union[int, float]]]

    class Config:
        from_attributes = True

class ClassAttendanceSummary(BaseModel):
    class_section_id: int
    date: datetime
    period_number: int
    subject_id: int
    total_students: int
    present_count: int
    absent_count: int
    late_count: int
    leave_count: int
    attendance_percentage: float

    class Config:
        from_attributes = True

class SubjectAttendanceReport(BaseModel):
    subject_id: int
    subject_name: str
    total_classes: int
    average_attendance: float
    attendance_trend: List[Dict[str, Union[datetime, float]]]

    class Config:
        from_attributes = True
