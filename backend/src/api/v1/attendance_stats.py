from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from ...database import get_db
from ...crud import attendance_stats as crud
from ...schemas import attendance_stats as schemas
from ...auth import get_current_user, get_current_active_user
from ...models.user import User

router = APIRouter(
    prefix="/attendance-stats",
    tags=["attendance-stats"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/student", response_model=schemas.StudentAttendanceReport)
async def get_student_attendance_stats(
    request: schemas.AttendanceStatsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get attendance statistics for a student."""
    if not request.student_id:
        raise HTTPException(status_code=400, detail="Student ID is required")

    # Check permissions
    if (current_user.role == "STUDENT" and current_user.id != request.student_id):
        raise HTTPException(status_code=403, detail="Not authorized to view other student's attendance")

    try:
        # Get date range based on time frame
        start_date, end_date = crud.get_time_frame_dates(
            request.time_frame,
            request.end_date
        )

        # Use custom dates if provided
        if request.time_frame == schemas.StatsTimeFrame.CUSTOM:
            start_date = request.start_date
            end_date = request.end_date

        return crud.get_student_attendance_stats(
            db=db,
            student_id=request.student_id,
            start_date=start_date,
            end_date=end_date,
            subject_id=request.subject_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/class", response_model=schemas.ClassAttendanceReport)
async def get_class_attendance_stats(
    request: schemas.AttendanceStatsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get attendance statistics for an entire class."""
    if not request.class_id:
        raise HTTPException(status_code=400, detail="Class ID is required")

    # Only teachers and admins can view class statistics
    if current_user.role not in ["TEACHER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to view class statistics")

    try:
        # Get date range based on time frame
        start_date, end_date = crud.get_time_frame_dates(
            request.time_frame,
            request.end_date
        )

        # Use custom dates if provided
        if request.time_frame == schemas.StatsTimeFrame.CUSTOM:
            start_date = request.start_date
            end_date = request.end_date

        return crud.get_class_attendance_stats(
            db=db,
            class_id=request.class_id,
            start_date=start_date,
            end_date=end_date,
            subject_id=request.subject_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-frames", response_model=List[str])
async def get_available_time_frames():
    """Get list of available time frames for attendance statistics."""
    return [frame.value for frame in schemas.StatsTimeFrame]
