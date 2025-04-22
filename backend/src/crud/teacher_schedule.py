from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from fastapi.encoders import jsonable_encoder

from ..models.teacher_schedule import (
    TeacherAvailability,
    LeaveRequest,
    Substitution,
    RoomAllocation,
    RoomSchedule,
    DayOfWeek
)
from ..schemas.teacher_schedule import (
    TeacherAvailabilityCreate,
    LeaveRequestCreate,
    LeaveRequestUpdate,
    SubstitutionCreate,
    RoomAllocationCreate,
    RoomScheduleCreate
)

# Teacher Availability
def create_teacher_availability(
    db: Session, availability: TeacherAvailabilityCreate
) -> TeacherAvailability:
    db_availability = TeacherAvailability(**availability.dict())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability

def get_teacher_availability(
    db: Session, teacher_id: int, day_of_week: Optional[DayOfWeek] = None
) -> List[TeacherAvailability]:
    query = db.query(TeacherAvailability).filter(
        TeacherAvailability.teacher_id == teacher_id
    )
    if day_of_week:
        query = query.filter(TeacherAvailability.day_of_week == day_of_week)
    return query.all()

def update_teacher_availability(
    db: Session, availability_id: int, availability_data: dict
) -> Optional[TeacherAvailability]:
    db_availability = db.query(TeacherAvailability).filter(
        TeacherAvailability.id == availability_id
    ).first()
    if db_availability:
        for field, value in availability_data.items():
            setattr(db_availability, field, value)
        db.commit()
        db.refresh(db_availability)
    return db_availability

# Leave Requests
def create_leave_request(
    db: Session, leave_request: LeaveRequestCreate
) -> LeaveRequest:
    db_leave_request = LeaveRequest(**leave_request.dict(), status="PENDING")
    db.add(db_leave_request)
    db.commit()
    db.refresh(db_leave_request)
    return db_leave_request

def get_leave_requests(
    db: Session,
    teacher_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[LeaveRequest]:
    query = db.query(LeaveRequest)
    if teacher_id:
        query = query.filter(LeaveRequest.teacher_id == teacher_id)
    if status:
        query = query.filter(LeaveRequest.status == status)
    return query.order_by(LeaveRequest.created_at.desc()).all()

def update_leave_request(
    db: Session,
    leave_request_id: int,
    leave_request_update: LeaveRequestUpdate
) -> Optional[LeaveRequest]:
    db_leave_request = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_request_id
    ).first()
    if db_leave_request:
        update_data = leave_request_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_leave_request, field, value)
        db.commit()
        db.refresh(db_leave_request)
    return db_leave_request

# Substitutions
def create_substitution(
    db: Session, substitution: SubstitutionCreate
) -> Substitution:
    db_substitution = Substitution(**substitution.dict(), status="PENDING")
    db.add(db_substitution)
    db.commit()
    db.refresh(db_substitution)
    return db_substitution

def get_substitutions(
    db: Session,
    teacher_id: Optional[int] = None,
    date: Optional[datetime] = None,
    status: Optional[str] = None
) -> List[Substitution]:
    query = db.query(Substitution)
    if teacher_id:
        query = query.filter(
            or_(
                Substitution.original_teacher_id == teacher_id,
                Substitution.substitute_teacher_id == teacher_id
            )
        )
    if date:
        query = query.filter(Substitution.date == date)
    if status:
        query = query.filter(Substitution.status == status)
    return query.order_by(Substitution.date).all()

def update_substitution_status(
    db: Session, substitution_id: int, status: str
) -> Optional[Substitution]:
    db_substitution = db.query(Substitution).filter(
        Substitution.id == substitution_id
    ).first()
    if db_substitution:
        db_substitution.status = status
        db.commit()
        db.refresh(db_substitution)
    return db_substitution

# Room Allocations
def create_room_allocation(
    db: Session, room_allocation: RoomAllocationCreate
) -> RoomAllocation:
    db_room = RoomAllocation(**room_allocation.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def get_available_rooms(
    db: Session,
    capacity: Optional[int] = None,
    features: Optional[List[str]] = None
) -> List[RoomAllocation]:
    query = db.query(RoomAllocation).filter(RoomAllocation.is_available == True)
    if capacity:
        query = query.filter(RoomAllocation.capacity >= capacity)
    if features:
        for feature in features:
            query = query.filter(RoomAllocation.features.contains([feature]))
    return query.all()

def get_room_schedule(
    db: Session,
    room_id: int,
    day_of_week: Optional[DayOfWeek] = None
) -> List[RoomSchedule]:
    query = db.query(RoomSchedule).filter(RoomSchedule.room_id == room_id)
    if day_of_week:
        query = query.filter(RoomSchedule.day_of_week == day_of_week)
    return query.order_by(RoomSchedule.period_number).all()

def create_room_schedule(
    db: Session, room_schedule: RoomScheduleCreate
) -> RoomSchedule:
    # Check for conflicts
    existing_schedule = db.query(RoomSchedule).filter(
        and_(
            RoomSchedule.room_id == room_schedule.room_id,
            RoomSchedule.day_of_week == room_schedule.day_of_week,
            RoomSchedule.period_number == room_schedule.period_number
        )
    ).first()
    
    if existing_schedule:
        raise ValueError("Room is already scheduled for this time slot")
    
    db_schedule = RoomSchedule(**room_schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule
