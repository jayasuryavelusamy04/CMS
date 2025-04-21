from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.student_profile import StudentProfile, Attendance, Mark
from models.subject import Subject, TimetableSlot
from schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileUpdate,
    AttendanceCreate,
    MarkCreate
)
from .base import CRUDBase

class CRUDStudentProfile(CRUDBase[StudentProfile, StudentProfileCreate, StudentProfileUpdate]):
    def get_by_student_id(self, db: Session, student_id: int) -> Optional[StudentProfile]:
        return db.query(self.model).filter(
            self.model.student_id == student_id,
            self.model.is_active == True
        ).first()

    def get_active_profiles(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        academic_year: Optional[str] = None
    ) -> List[StudentProfile]:
        query = db.query(self.model).filter(self.model.is_active == True)
        
        if academic_year:
            query = query.filter(self.model.academic_year == academic_year)
        
        return query.offset(skip).limit(limit).all()

    def create_attendance(
        self,
        db: Session,
        *,
        obj_in: AttendanceCreate
    ) -> Attendance:
        # Verify the student is assigned to the subject through their class
        student_profile = self.get(db, id=obj_in.student_profile_id)
        if not student_profile:
            raise ValueError("Student profile not found")

        # Check if subject belongs to student's class
        subject_assigned = db.query(Subject)\
            .join(TimetableSlot)\
            .filter(
                Subject.id == obj_in.subject_id,
                TimetableSlot.class_section_id == student_profile.student.class_section_id
            ).first()
        
        if not subject_assigned:
            raise ValueError("Subject is not assigned to student's class")

        db_obj = Attendance(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_mark(
        self,
        db: Session,
        *,
        obj_in: MarkCreate
    ) -> Mark:
        # Verify the student is assigned to the subject
        student_profile = self.get(db, id=obj_in.student_profile_id)
        if not student_profile:
            raise ValueError("Student profile not found")

        # Check if subject belongs to student's class
        subject_assigned = db.query(Subject)\
            .join(TimetableSlot)\
            .filter(
                Subject.id == obj_in.subject_id,
                TimetableSlot.class_section_id == student_profile.student.class_section_id
            ).first()
        
        if not subject_assigned:
            raise ValueError("Subject is not assigned to student's class")

        db_obj = Mark(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_attendance_by_date_range(
        self,
        db: Session,
        *,
        student_profile_id: int,
        start_date: date,
        end_date: date
    ) -> List[Attendance]:
        return db.query(Attendance)\
            .filter(
                Attendance.student_profile_id == student_profile_id,
                Attendance.date.between(start_date, end_date)
            ).all()

    def get_marks_by_subject(
        self,
        db: Session,
        *,
        student_profile_id: int,
        subject_id: int
    ) -> List[Mark]:
        return db.query(Mark)\
            .filter(
                Mark.student_profile_id == student_profile_id,
                Mark.subject_id == subject_id
            ).all()

    def calculate_attendance_percentage(
        self,
        db: Session,
        *,
        student_profile_id: int,
        subject_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> float:
        query = db.query(
            func.count(case([(Attendance.status == 'present', 1)])).label('present_count'),
            func.count().label('total_count')
        ).filter(Attendance.student_profile_id == student_profile_id)

        if subject_id:
            query = query.filter(Attendance.subject_id == subject_id)
        
        if start_date and end_date:
            query = query.filter(Attendance.date.between(start_date, end_date))

        result = query.first()
        if result.total_count == 0:
            return 0.0
        
        return (result.present_count / result.total_count) * 100

    def calculate_subject_average(
        self,
        db: Session,
        *,
        student_profile_id: int,
        subject_id: int
    ) -> float:
        result = db.query(
            func.sum(Mark.marks_obtained * Mark.weightage).label('weighted_sum'),
            func.sum(Mark.max_marks * Mark.weightage).label('max_weighted_sum')
        ).filter(
            Mark.student_profile_id == student_profile_id,
            Mark.subject_id == subject_id
        ).first()

        if not result.max_weighted_sum:
            return 0.0
        
        return (result.weighted_sum / result.max_weighted_sum) * 100

student_profile = CRUDStudentProfile(StudentProfile)
