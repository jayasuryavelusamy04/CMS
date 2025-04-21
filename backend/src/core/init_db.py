from sqlalchemy import text
import logging
from sqlalchemy.orm import Session
from datetime import datetime

from src.core.database import Base, engine, SessionLocal
from src.core.config import settings
from src.core.security import get_password_hash
# Import all models to ensure they are registered
from src import models  # noqa: F401
from src.models.staff import Staff, StaffRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create initial admin user if it doesn't exist
        db = SessionLocal()
        try:
            create_initial_admin(db)
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def create_initial_admin(db: Session) -> None:
    # Check if admin user already exists
    admin = db.query(Staff).filter(Staff.email == settings.FIRST_SUPERUSER).first()
    if not admin:
        admin_in = Staff(
            email=settings.FIRST_SUPERUSER,
            name="Administrator",
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            role=StaffRole.ADMIN,
            is_active=True,
            hire_date=datetime.utcnow()
        )
        db.add(admin_in)
        db.commit()
        logger.info("Initial admin user created")
    else:
        logger.info("Admin user already exists")
