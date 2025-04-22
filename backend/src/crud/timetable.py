from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, case
from datetime import datetime, time
from typing import List, Optional
from ..models.timetable import Period, TimetableSlot, Attendance, TimetableConfig, TimetableChangeLog
from ..schemas.timetable import (
    PeriodCreate, PeriodUpdate,
    TimetableSlotCreate, TimetableSlotUpdate,
    AttendanceCreate, AttendanceUpdate,
    TimetableConfigCreate, TimetableConfigUpdate,
    AttendanceReport, AttendanceReportParams
)

class PeriodCRUD:
    def create(self, db: Session, *, obj_in: PeriodCreate) -> Period:
        db_obj = Period(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_class_section(self, db: Session, class_section_id: int) -> List[Period]:
        return db.query(Period).filter(Period.class_section_id == class_section_id).all()

    def check_period_overlap(self, db: Session, class_section_id: int, day_of_week: int,
                           start_time: time, end_time: time, exclude_id: Optional[int] = None) -> bool:
        query = db.query(Period).filter(
            Period.class_section_id == class_section_id,
            Period.day_of_week == day_of_week,
            Period.is_active == True,
            or_(
                and_(start_time >= Period.start_time, start_time < Period.end_time),
                and_(end_time > Period.start_time, end_time <= Period.end_time),
                and_(start_time <= Period.start_time, end_time >= Period.end_time)
            )
        )
        if exclude_id:
            query = query.filter(Period.id != exclude_id)
        return db.query(query.exists()).scalar()

class TimetableSlotCRUD:
    def create(self, db: Session, *, obj_in: TimetableSlotCreate) -> TimetableSlot:
        db_obj = TimetableSlot(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def check_teacher_conflict(self, db: Session, teacher_id: int, period_id: int,
                             exclude_id: Optional[int] = None) -> bool:
        period = db.query(Period).filter(Period.id == period_id).first()
        if not period:
            return False

        query = db.query(TimetableSlot).join(Period).filter(
            TimetableSlot.teacher_id == teacher_id,
            Period.day_of_week == period.day_of_week,
            Period.start_time == period.start_time,
            Period.end_time == period.end_time,
            TimetableSlot.is_active == True
        )
        if exclude_id:
            query = query.filter(TimetableSlot.id != exclude_id)
        return db.query(query.exists()).scalar()

    def log_change(self, db: Session, *, slot_id: int, changed_by: int,
                  change_type: str, previous_data: str, new_data: str,
                  reason: Optional[str] = None) -> TimetableChangeLog:
        log = TimetableChangeLog(
            timetable_slot_id=slot_id,
            changed_by=changed_by,
            change_type=change_type,
            previous_data=previous_data,
            new_data=new_data,
            reason=reason
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

class AttendanceCRUD:
    def create(self, db: Session, *, obj_in: AttendanceCreate) -> Attendance:
        db_obj = Attendance(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_student_attendance(self, db: Session, student_id: int,
                             start_date: datetime, end_date: datetime) -> List[Attendance]:
        return db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date
        ).all()

    def generate_report(self, db: Session, params: AttendanceReportParams) -> List[AttendanceReport]:
        # Base query
        query = db.query(
            Attendance.student_id,
            func.count(Attendance.id).label('total_days'),
            func.sum(case((Attendance.status == 'present', 1), else_=0)).label('present_days'),
            func.sum(case((Attendance.status == 'absent', 1), else_=0)).label('absent_days'),
            func.sum(case((Attendance.status == 'late', 1), else_=0)).label('late_days'),
            func.sum(case((Attendance.status == 'excused', 1), else_=0)).label('excused_days')
        ).filter(
            Attendance.date >= params.start_date,
            Attendance.date <= params.end_date
        )

        # Apply filters
        if params.class_section_id:
            query = query.join(TimetableSlot).join(Period).filter(
                Period.class_section_id == params.class_section_id
            )
        if params.student_id:
            query = query.filter(Attendance.student_id == params.student_id)
        if params.subject_id:
            query = query.join(TimetableSlot).filter(
                TimetableSlot.subject_id == params.subject_id
            )

        # Group by student
        query = query.group_by(Attendance.student_id)

        # Convert to report format
        results = []
        for row in query.all():
            total_possible = row.total_days
            present_days = row.present_days or 0
            percentage = (present_days / total_possible * 100) if total_possible > 0 else 0

            report = AttendanceReport(
                student_id=row.student_id,
                total_days=total_possible,
                present_days=present_days,
                absent_days=row.absent_days or 0,
                late_days=row.late_days or 0,
                excused_days=row.excused_days or 0,
                attendance_percentage=round(percentage, 2),
                period_wise_attendance={},  # Detailed period-wise attendance if needed
                date_range=(params.start_date, params.end_date)
            )
            results.append(report)

        return results

class TimetableConfigCRUD:
    def create(self, db: Session, *, obj_in: TimetableConfigCreate) -> TimetableConfig:
        db_obj = TimetableConfig(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_active_config(self, db: Session, class_section_id: int) -> Optional[TimetableConfig]:
        return db.query(TimetableConfig).filter(
            TimetableConfig.class_section_id == class_section_id,
            TimetableConfig.is_active == True
        ).first()

period = PeriodCRUD()
timetable_slot = TimetableSlotCRUD()
attendance = AttendanceCRUD()
timetable_config = TimetableConfigCRUD()
