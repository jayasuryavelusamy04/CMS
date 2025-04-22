from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import enum

class AttendanceMarkingMethod(str, enum.Enum):
    MANUAL = "manual"
    QR_CODE = "qr_code"
    BIOMETRIC = "biometric"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

class StudentAttendance(Base):
    __tablename__ = "student_attendances"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    timetable_slot_id = Column(Integer, ForeignKey("timetable_slots.id"), nullable=True)
    status = Column(Enum(AttendanceStatus), nullable=False)
    date = Column(DateTime, nullable=False)
    note = Column(Text)
    marked_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    period_number = Column(Integer)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="attendances")
    student_profile = relationship("StudentProfile", back_populates="attendances")
    timetable_slot = relationship("TimetableSlot", back_populates="attendances")
    teacher = relationship("Staff", foreign_keys=[marked_by])

class AttendanceAuditLog(Base):
    __tablename__ = "attendance_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("student_attendances.id"), nullable=False)
    modified_by = Column(Integer, ForeignKey("staff.id"), nullable=False)
    old_status = Column(Enum(AttendanceStatus), nullable=True)
    new_status = Column(Enum(AttendanceStatus), nullable=False)
    action = Column(String, nullable=False)
    reason = Column(Text)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class QRCodeAttendance(Base):
    __tablename__ = "qr_code_attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    qr_code = Column(String, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    is_valid = Column(Boolean, default=True)
    scanned_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class GeolocationAttendance(Base):
    __tablename__ = "geolocation_attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_within_bounds = Column(Boolean, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class OfflineAttendanceSync(Base):
    __tablename__ = "offline_attendance_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    sync_id = Column(String, nullable=False, unique=True)
    sync_data = Column(JSON, nullable=False)
    sync_status = Column(String, nullable=False)
    error_details = Column(JSON, nullable=True)
    synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class AttendanceNotification(Base):
    __tablename__ = "attendance_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
