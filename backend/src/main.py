from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.init_db import init_db
from src.api import router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Campus Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
