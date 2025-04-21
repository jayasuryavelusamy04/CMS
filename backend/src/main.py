from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.v1 import (
    auth,
    admission,
    staff,
    student_profile,
    timetable,
    fees,
    teacher_schedule,
    attendance,
    attendance_stats
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    admission.router,
    prefix=f"{settings.API_V1_STR}/admissions",
    tags=["Admissions"]
)

app.include_router(
    staff.router,
    prefix=f"{settings.API_V1_STR}/staff",
    tags=["Staff Management"]
)

app.include_router(
    student_profile.router,
    prefix=f"{settings.API_V1_STR}/student-profiles",
    tags=["Student Profiles"]
)

app.include_router(
    timetable.router,
    prefix=f"{settings.API_V1_STR}/timetable",
    tags=["Timetable"]
)

app.include_router(
    fees.router,
    prefix=f"{settings.API_V1_STR}/fees",
    tags=["Fee Management"]
)

app.include_router(
    teacher_schedule.router,
    prefix=f"{settings.API_V1_STR}/teacher-schedules",
    tags=["Teacher Schedules"]
)

app.include_router(
    attendance.router,
    prefix=f"{settings.API_V1_STR}/attendance",
    tags=["Attendance Management"]
)

app.include_router(
    attendance_stats.router,
    prefix=f"{settings.API_V1_STR}/attendance-stats",
    tags=["Attendance Statistics"]
)

@app.get("/")
def root():
    return {
        "message": "Welcome to School Management System API",
        "version": settings.PROJECT_VERSION,
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
