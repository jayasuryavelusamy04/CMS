from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from core.security import get_password_hash, verify_password
from core.models import User, UserRole
from schemas.auth import UserCreate, UserUpdate

class AuthCRUD:
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create new user"""
        # Check if username or email already exists
        if self.get_user_by_username(db, user_data.username):
            raise IntegrityError("Username already registered", None, None)
        if self.get_user_by_email(db, user_data.email):
            raise IntegrityError("Email already registered", None, None)

        # Create user with hashed password
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            hashed_password=get_password_hash(user_data.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user by username and password"""
        user = self.get_user_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def update_user(self, db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user details"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None

        update_data = user_update.dict(exclude_unset=True)
        
        # Hash new password if provided
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    def update_last_login(self, db: Session, user: User) -> User:
        """Update user's last login timestamp"""
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    def change_password(
        self, 
        db: Session,
        user: User,
        current_password: str,
        new_password: str
    ) -> bool:
        """Change user's password"""
        if not verify_password(current_password, user.hashed_password):
            return False
        
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        return True

auth_crud = AuthCRUD()
