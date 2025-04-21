from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, JSON, Float
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    ON_LEAVE = "ON_LEAVE"

class AttendanceMarkingMethod(str, enum.Enum):
    MANUAL = "MANUAL"
    QR_CODE = "QR_CODE"
    GEOLOCATION = "GEOLOCATION"
    OFFLINE_SYNC = "OFFLINE_SYNC"

class StudentAttendance(Base):
    __tablename__ = "student_attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("staff.id"))
    date = Column(DateTime)
    period_number = Column(Integer)
    status = Column(Enum(AttendanceStatus))
    marking_method = Column(Enum(AttendanceMarkingMethod))
    marked_at = Column(DateTime, default=datetime.utcnow)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sync_id = Column(String, nullable=True)  # For offline sync tracking

    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    class_section = relationship("ClassSection")
    subject = relationship("Subject")
    teacher = relationship("Staff")
    audit_logs = relationship("AttendanceAuditLog", back_populates="attendance")

class AttendanceAuditLog(Base):
    __tablename__ = "attendance_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("student_attendance.id"))
    modified_by = Column(Integer, ForeignKey("staff.id"))
    old_status = Column(Enum(AttendanceStatus))
    new_status = Column(Enum(AttendanceStatus))
    action = Column(String)  # CREATE, UPDATE, DELETE
    reason = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attendance = relationship("StudentAttendance", back_populates="audit_logs")
    modifier = relationship("Staff")

class QRCodeAttendance(Base):
    __tablename__ = "qr_code_attendance"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("student_attendance.id"))
    qr_code = Column(String, unique=True)
    scanned_at = Column(DateTime)
    device_info = Column(JSON)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attendance = relationship("StudentAttendance")

class GeolocationAttendance(Base):
    __tablename__ = "geolocation_attendance"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("student_attendance.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    accuracy = Column(Float)
    device_info = Column(JSON)
    is_within_bounds = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attendance = relationship("StudentAttendance")

class OfflineAttendanceSync(Base):
    __tablename__ = "offline_attendance_sync"

    id = Column(Integer, primary_key=True, index=True)
    sync_id = Column(String, unique=True)
    device_id = Column(String)
    sync_data = Column(JSON)  # Holds attendance records in JSON format
    sync_status = Column(String)  # PENDING, SYNCED, FAILED
    synced_at = Column(DateTime, nullable=True)
    error_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AttendanceNotification(Base):
    __tablename__ = "attendance_notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    attendance_id = Column(Integer, ForeignKey("student_attendance.id"))
    notification_type = Column(String)  # SMS, EMAIL, PUSH
    status = Column(String)  # PENDING, SENT, FAILED
    content = Column(String)
    error_message = Column(String, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("Student")
    attendance = relationship("StudentAttendance")
