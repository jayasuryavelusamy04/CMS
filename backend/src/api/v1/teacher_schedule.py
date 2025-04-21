from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime, date

from core.deps import get_db
from schemas.teacher_schedule import (
    TeacherAvailability,
    TeacherAvailabilityCreate,
    LeaveRequest,
    LeaveRequestCreate,
    LeaveRequestUpdate,
    Substitution,
    SubstitutionCreate,
    RoomAllocation,
    RoomAllocationCreate,
    RoomSchedule,
    RoomScheduleCreate,
    TeacherScheduleResponse,
    RoomScheduleResponse
)
import crud.teacher_schedule as crud

router = APIRouter()

# Teacher Availability
@router.post("/availability/", response_model=TeacherAvailability)
def create_availability(
    availability: TeacherAvailabilityCreate,
    db: Session = Depends(get_db)
):
    """Create new teacher availability record"""
    return crud.create_teacher_availability(db, availability)

@router.get("/availability/{teacher_id}", response_model=List[TeacherAvailability])
def get_teacher_availability(
    teacher_id: int,
    day_of_week: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get teacher's availability"""
    return crud.get_teacher_availability(db, teacher_id, day_of_week)

# Leave Requests
@router.post("/leave-requests/", response_model=LeaveRequest)
def create_leave_request(
    leave_request: LeaveRequestCreate,
    db: Session = Depends(get_db)
):
    """Create a new leave request"""
    return crud.create_leave_request(db, leave_request)

@router.get("/leave-requests/", response_model=List[LeaveRequest])
def get_leave_requests(
    teacher_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get leave requests with optional filters"""
    return crud.get_leave_requests(db, teacher_id, status)

@router.put("/leave-requests/{leave_request_id}", response_model=LeaveRequest)
def update_leave_request(
    leave_request_id: int,
    update_data: LeaveRequestUpdate,
    db: Session = Depends(get_db)
):
    """Update leave request status"""
    updated = crud.update_leave_request(db, leave_request_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return updated

# Substitutions
@router.post("/substitutions/", response_model=Substitution)
def create_substitution(
    substitution: SubstitutionCreate,
    db: Session = Depends(get_db)
):
    """Create a new substitution request"""
    return crud.create_substitution(db, substitution)

@router.get("/substitutions/", response_model=List[Substitution])
def get_substitutions(
    teacher_id: Optional[int] = None,
    date: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get substitutions with optional filters"""
    return crud.get_substitutions(db, teacher_id, date, status)

@router.put("/substitutions/{substitution_id}/status", response_model=Substitution)
def update_substitution_status(
    substitution_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update substitution status"""
    updated = crud.update_substitution_status(db, substitution_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Substitution not found")
    return updated

# Room Allocations
@router.post("/rooms/", response_model=RoomAllocation)
def create_room(
    room: RoomAllocationCreate,
    db: Session = Depends(get_db)
):
    """Create a new room"""
    return crud.create_room_allocation(db, room)

@router.get("/rooms/available/", response_model=List[RoomAllocation])
def get_available_rooms(
    capacity: Optional[int] = None,
    features: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """Get available rooms with optional filters"""
    return crud.get_available_rooms(db, capacity, features)

@router.post("/rooms/schedule/", response_model=RoomSchedule)
def create_room_schedule(
    schedule: RoomScheduleCreate,
    db: Session = Depends(get_db)
):
    """Create a new room schedule"""
    try:
        return crud.create_room_schedule(db, schedule)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/rooms/{room_id}/schedule", response_model=RoomScheduleResponse)
def get_room_schedule(
    room_id: int,
    day_of_week: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get room schedule"""
    schedule = crud.get_room_schedule(db, room_id, day_of_week)
    if not schedule:
        raise HTTPException(status_code=404, detail="Room schedule not found")
    
    # Format response
    return {
        "room_id": room_id,
        "room_number": schedule[0].room.room_number if schedule else None,
        "schedule": {day: [s for s in schedule if s.day_of_week == day] for day in set(s.day_of_week for s in schedule)}
    }
