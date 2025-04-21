from fastapi import APIRouter
from .auth import router as auth_router
from .staff import router as staff_router
from .admission import router as admission_router
from .attendance import router as attendance_router
from .attendance_stats import router as attendance_stats_router
from .fees import router as fees_router
from .student_profile import router as student_profile_router
from .teacher_schedule import router as teacher_schedule_router
from .timetable import router as timetable_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(staff_router, prefix="/staff", tags=["staff"])
router.include_router(admission_router, prefix="/admission", tags=["admission"])
router.include_router(attendance_router, prefix="/attendance", tags=["attendance"])
router.include_router(attendance_stats_router, prefix="/attendance-stats", tags=["attendance-stats"])
router.include_router(fees_router, prefix="/fees", tags=["fees"])
router.include_router(student_profile_router, prefix="/student-profile", tags=["student-profile"])
router.include_router(teacher_schedule_router, prefix="/teacher-schedule", tags=["teacher-schedule"])
router.include_router(timetable_router, prefix="/timetable", tags=["timetable"])
