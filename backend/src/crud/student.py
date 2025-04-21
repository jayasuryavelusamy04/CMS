from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.student import Student, AdmissionStatus
from src.schemas.student import StudentCreate, StudentUpdate
from src.crud.base import CRUDBase
from fastapi.encoders import jsonable_encoder

class CRUDStudent(CRUDBase[Student, StudentCreate, StudentUpdate]):
    def create_with_guardians(
        self, db: Session, *, obj_in: StudentCreate
    ) -> Student:
        obj_in_data = jsonable_encoder(obj_in, exclude={'guardians'})
        db_obj = self.model(**obj_in_data)
        
        # Create guardians
        from src.crud.guardian import guardian
        for guardian_data in obj_in.guardians:
            guardian_obj = guardian.create(db, obj_in=guardian_data)
            db_obj.guardians.append(guardian_obj)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        admission_status: Optional[AdmissionStatus] = None,
        search: Optional[str] = None
    ) -> List[Student]:
        query = db.query(self.model)
        
        if admission_status:
            query = query.filter(self.model.admission_status == admission_status)
        
        if search:
            search_filter = (
                (func.lower(self.model.first_name).contains(search.lower())) |
                (func.lower(self.model.last_name).contains(search.lower())) |
                (func.lower(self.model.contact_number).contains(search.lower()))
            )
            query = query.filter(search_filter)
        
        return query.offset(skip).limit(limit).all()

    def get_total_count(
        self,
        db: Session,
        *,
        admission_status: Optional[AdmissionStatus] = None,
        search: Optional[str] = None
    ) -> int:
        query = db.query(func.count(self.model.id))
        
        if admission_status:
            query = query.filter(self.model.admission_status == admission_status)
        
        if search:
            search_filter = (
                (func.lower(self.model.first_name).contains(search.lower())) |
                (func.lower(self.model.last_name).contains(search.lower())) |
                (func.lower(self.model.contact_number).contains(search.lower()))
            )
            query = query.filter(search_filter)
        
        return query.scalar()

student = CRUDStudent(Student)
