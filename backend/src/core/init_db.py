from typing import Optional
from sqlalchemy.orm import Session

from core.models import User, UserRole
from core.security import get_password_hash
from core.config import settings
from core.database import SessionLocal, Base, engine

def init_db(db: Session) -> None:
    """Initialize the database with default admin user"""
    # Check if admin user already exists
    admin = db.query(User).filter(
        User.email == settings.FIRST_ADMIN_EMAIL
    ).first()
    
    if not admin:
        admin = User(
            username="admin",
            email=settings.FIRST_ADMIN_EMAIL,
            full_name="System Administrator",
            hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"Created default admin user with email: {settings.FIRST_ADMIN_EMAIL}")

def ensure_admin_exists() -> None:
    """Ensure that at least one admin user exists in the database."""
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

if __name__ == "__main__":
    # Create database tables if they don't exist
    # Note: In production, use Alembic migrations instead
    Base.metadata.create_all(bind=engine)
    ensure_admin_exists()
    print("Database initialization completed")
