from datetime import date
from typing import Dict, Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from core.models import Student, Guardian, AdmissionStatus
from schemas.admission import StudentCreate, StudentUpdate, GuardianCreate, GuardianUpdate

class AdmissionCRUD:
    def create_student(self, db: Session, student: StudentCreate) -> Dict[str, Any]:
        """Create a new student with guardian information"""
        # Create student
        db_student = Student(
            first_name=student.first_name,
            last_name=student.last_name,
            date_of_birth=student.date_of_birth,
            gender=student.gender,
            nationality=student.nationality,
            email=student.email,
            phone_primary=student.phone_primary,
            phone_secondary=student.phone_secondary,
            address_permanent=student.address_permanent,
            address_temporary=student.address_temporary,
            city=student.city,
            state=student.state,
            country=student.country,
            postal_code=student.postal_code,
            current_class=student.current_class,
            current_section=student.current_section,
            admission_number=student.admission_number,
            admission_status=AdmissionStatus.PENDING
        )
        db.add(db_student)
        
        # Create guardians
        for guardian_data in student.guardians:
            guardian = Guardian(
                first_name=guardian_data.first_name,
                last_name=guardian_data.last_name,
                relationship=guardian_data.relationship,
                email=guardian_data.email,
                phone_primary=guardian_data.phone_primary,
                phone_secondary=guardian_data.phone_secondary,
                occupation=guardian_data.occupation,
                address=guardian_data.address,
                city=guardian_data.city,
                state=guardian_data.state,
                country=guardian_data.country,
                postal_code=guardian_data.postal_code,
                has_portal_access=guardian_data.has_portal_access
            )
            db.add(guardian)
            db_student.guardians.append(guardian)
        
        db.commit()
        db.refresh(db_student)
        
        return {
            "student": db_student,
            "message": "Student admission created successfully"
        }

    def list_students(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        filters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """List students with filtering options"""
        query = db.query(Student)

        if filters:
            if filters.get("search"):
                search = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Student.first_name.ilike(search),
                        Student.last_name.ilike(search),
                        Student.admission_number.ilike(search)
                    )
                )
            
            if filters.get("status"):
                query = query.filter(Student.admission_status == filters["status"])
            
            if filters.get("class_name"):
                query = query.filter(Student.current_class == filters["class_name"])
            
            if filters.get("section"):
                query = query.filter(Student.current_section == filters["section"])
            
            if filters.get("admission_date_from"):
                query = query.filter(Student.admission_date >= filters["admission_date_from"])
            
            if filters.get("admission_date_to"):
                query = query.filter(Student.admission_date <= filters["admission_date_to"])

        total = query.count()
        students = query.offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "students": students
        }

    def get_student(self, db: Session, student_id: int) -> Optional[Student]:
        """Get student by ID"""
        return db.query(Student).filter(Student.id == student_id).first()

    def update_student(
        self,
        db: Session,
        student_id: int,
        student_update: StudentUpdate
    ) -> Optional[Student]:
        """Update student details"""
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if db_student:
            update_data = student_update.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_student, key, value)
            db.commit()
            db.refresh(db_student)
        return db_student

    def update_admission_status(
        self,
        db: Session,
        student_id: int,
        status: AdmissionStatus,
        message: Optional[str] = None
    ) -> Optional[Student]:
        """Update student admission status"""
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if db_student:
            db_student.admission_status = status
            db.commit()
            db.refresh(db_student)
            # Here we would trigger notifications based on status change
            # TODO: Implement notification system
        return db_student

    def delete_student(self, db: Session, student_id: int) -> bool:
        """Delete student record"""
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if db_student:
            db.delete(db_student)
            db.commit()
            return True
        return False

    def create_guardian(self, db: Session, guardian: GuardianCreate) -> Guardian:
        """Create a new guardian"""
        db_guardian = Guardian(**guardian.dict())
        db.add(db_guardian)
        db.commit()
        db.refresh(db_guardian)
        return db_guardian

    def get_guardian(self, db: Session, guardian_id: int) -> Optional[Guardian]:
        """Get guardian by ID"""
        return db.query(Guardian).filter(Guardian.id == guardian_id).first()

    def update_guardian(
        self,
        db: Session,
        guardian_id: int,
        guardian_update: GuardianUpdate
    ) -> Optional[Guardian]:
        """Update guardian details"""
        db_guardian = db.query(Guardian).filter(Guardian.id == guardian_id).first()
        if db_guardian:
            update_data = guardian_update.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_guardian, key, value)
            db.commit()
            db.refresh(db_guardian)
        return db_guardian

    def link_guardian_to_student(
        self,
        db: Session,
        student_id: int,
        guardian_id: int
    ) -> bool:
        """Link an existing guardian to a student"""
        student = db.query(Student).filter(Student.id == student_id).first()
        guardian = db.query(Guardian).filter(Guardian.id == guardian_id).first()
        
        if student and guardian:
            student.guardians.append(guardian)
            db.commit()
            return True
        return False

    def unlink_guardian_from_student(
        self,
        db: Session,
        student_id: int,
        guardian_id: int
    ) -> bool:
        """Unlink a guardian from a student"""
        student = db.query(Student).filter(Student.id == student_id).first()
        guardian = db.query(Guardian).filter(Guardian.id == guardian_id).first()
        
        if student and guardian and guardian in student.guardians:
            student.guardians.remove(guardian)
            db.commit()
            return True
        return False

admission_crud = AdmissionCRUD()
