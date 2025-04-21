from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.config import settings
from core.deps import get_db, get_current_user_id, allow_admin
from core.security import create_access_token, create_refresh_token
from crud.auth import auth_crud
from schemas.auth import (
    User,
    UserCreate,
    UserUpdate,
    Token,
    LoginResponse,
    ChangePassword
)

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access token"""
    user = auth_crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )

    # Update last login
    user = auth_crud.update_last_login(db, user)

    # Create access and refresh tokens
    access_token = create_access_token(
        user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(user.id)

    return {
        "token": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        },
        "user": user
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Refresh access token"""
    user = auth_crud.get_user_by_id(db, int(current_user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user or inactive account"
        )
    
    access_token = create_access_token(
        user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=User)
async def get_current_user(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get current user information"""
    user = auth_crud.get_user_by_id(db, int(current_user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/register", response_model=User)
async def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    _: bool = Depends(allow_admin)  # Only admin can register new users
):
    """Register a new user (admin only)"""
    user = auth_crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    user = auth_crud.get_user_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this username already exists"
        )
    
    user = auth_crud.create_user(db, user_in)
    return user

@router.put("/me", response_model=User)
async def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update own user information"""
    user = auth_crud.get_user_by_username(db, current_user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user = auth_crud.update_user(db, user.id, user_in)
    return user

@router.post("/me/change-password")
async def change_password(
    *,
    db: Session = Depends(get_db),
    password_in: ChangePassword,
    current_user_id: str = Depends(get_current_user_id)
):
    """Change own password"""
    user = auth_crud.get_user_by_username(db, current_user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if not auth_crud.change_password(
        db, user, password_in.current_password, password_in.new_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid current password"
        )
    
    return {"message": "Password updated successfully"}
