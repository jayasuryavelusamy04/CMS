from sqlalchemy.orm import Session
from sqlalchemy import func, and_, between
from datetime import date, timedelta
from typing import List, Optional

from ..models.attendance import Attendance
from ..schemas import attendance_stats as schemas

def calculate_attendance_stats(records: List[Attendance]) -> schemas.AttendanceStats:
    total = len(records)
    if total == 0:
        return schemas.AttendanceStats(
            total_classes=0,
            present=0,
            absent=0,
            late=0,
            on_leave=0,
            percentage=0.0
        )

    present = sum(1 for r in records if r.status == 'PRESENT')
    absent = sum(1 for r in records if r.status == 'ABSENT')
    late = sum(1 for r in records if r.status == 'LATE')
    on_leave = sum(1 for r in records if r.status == 'ON_LEAVE')
    
    return schemas.AttendanceStats(
        total_classes=total,
        present=present,
        absent=absent,
        late=late,
        on_leave=on_leave,
        percentage=((present + late) / total * 100) if total > 0 else 0.0
    )

def get_student_attendance_stats(
    db: Session,
    student_id: int,
    start_date: date,
    end_date: date,
    subject_id: Optional[int] = None
) -> schemas.StudentAttendanceReport:
    query = db.query(Attendance).filter(
        and_(
            Attendance.student_id == student_id,
            between(Attendance.date, start_date, end_date)
        )
    )

    if subject_id:
        query = query.filter(Attendance.subject_id == subject_id)

    records = query.all()
    stats = calculate_attendance_stats(records)
    
    daily_records = [
        schemas.DailyAttendance(
            date=record.date,
            status=record.status
        )
        for record in records
    ]

    return schemas.StudentAttendanceReport(
        student_id=student_id,
        total_stats=stats,
        daily_records=daily_records
    )

def get_class_attendance_stats(
    db: Session,
    class_id: int,
    start_date: date,
    end_date: date,
    subject_id: Optional[int] = None
) -> schemas.ClassAttendanceReport:
    query = db.query(Attendance).filter(
        and_(
            Attendance.class_section_id == class_id,
            between(Attendance.date, start_date, end_date)
        )
    )

    if subject_id:
        query = query.filter(Attendance.subject_id == subject_id)

    records = query.all()
    
    # Group records by student
    student_records = {}
    for record in records:
        if record.student_id not in student_records:
            student_records[record.student_id] = []
        student_records[record.student_id].append(record)

    # Calculate stats for each student
    student_stats = []
    for student_id, student_records in student_records.items():
        stats = calculate_attendance_stats(student_records)
        daily_records = [
            schemas.DailyAttendance(
                date=record.date,
                status=record.status
            )
            for record in student_records
        ]
        student_stats.append(
            schemas.StudentAttendanceReport(
                student_id=student_id,
                total_stats=stats,
                daily_records=daily_records
            )
        )

    # Calculate overall class stats
    total_stats = calculate_attendance_stats(records)

    return schemas.ClassAttendanceReport(
        class_id=class_id,
        subject_id=subject_id,
        total_stats=total_stats,
        student_stats=student_stats
    )

def get_time_frame_dates(time_frame: schemas.StatsTimeFrame, end_date: Optional[date] = None) -> tuple[date, date]:
    if not end_date:
        end_date = date.today()
    
    if time_frame == schemas.StatsTimeFrame.DAILY:
        start_date = end_date
    elif time_frame == schemas.StatsTimeFrame.WEEKLY:
        # Start from Monday of the current week
        start_date = end_date - timedelta(days=end_date.weekday())
    elif time_frame == schemas.StatsTimeFrame.MONTHLY:
        # Start from first day of the current month
        start_date = end_date.replace(day=1)
    else:  # CUSTOM - return same dates
        start_date = end_date

    return start_date, end_date
