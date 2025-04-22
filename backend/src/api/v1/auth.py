from datetime import timedelta
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...core.config import settings
from ...core import security
from ...core.deps import get_db
from ...crud.auth import auth_crud
from ...schemas.auth import Token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    db: Session = Depends(get_db),
    credentials: Dict = Body(...)
) -> Any:
    """
    Login endpoint that accepts JSON data
    """
    user = auth_crud.authenticate(
        db, email=credentials.get("username"), password=credentials.get("password")
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    role = user.role.value if hasattr(user, 'role') else 'student'
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires, role=role
        ),
        "token_type": "bearer",
    }

@router.post("/test-token", response_model=Token)
def test_token(current_user: Any = Depends(get_db)) -> Any:
    """
    Test access token
    """
    return current_user
