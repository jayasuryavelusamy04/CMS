from datetime import time, datetime
from typing import Optional
from sqlalchemy.orm import Session

from src.models.staff import Staff
from src.schemas.staff import StaffCreate, StaffUpdate
from src.crud.base import CRUDBase

class CRUDStaff(CRUDBase[Staff, StaffCreate, StaffUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Staff]:
        return db.query(Staff).filter(Staff.email == email).first()

    def get_available_staff(
        self,
        db: Session,
        *,
        day_of_week: int,
        start_time: time,
        end_time: time
    ) -> list[Staff]:
        """
        Get all staff members available during the specified time slot
        """
        # TODO: Implement the logic to check staff availability
        return []

staff = CRUDStaff(Staff)
