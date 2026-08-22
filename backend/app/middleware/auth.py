"""Authentication Middleware
Responsibilities:
- Read Bearer token
- Decode and validate JWT
- Load authenticated user from repository based on role
- Enforce active account status
- Provide get_current_user and backward-compatible get_current_admin dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.database.database import get_db
from app.models.admin import Admin
from app.models.teacher import Teacher
from app.models.student import Student
from app.core.security import decode_token
from app.repositories.admin_repository import AdminRepository
from app.repositories.teacher_repository import TeacherRepository
from app.repositories.student_repository import StudentRepository

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Admin | Teacher | Student:
    """Validate JWT and return the authenticated user from the appropriate repository."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception

        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    if role == "admin":
        user = AdminRepository.get_by_id(db, user_id_int)
    elif role == "teacher":
        user = TeacherRepository.get_by_id(db, user_id_int)
    elif role == "student":
        user = StudentRepository.get_by_id(db, user_id_int)
    else:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    return user


def get_current_admin(
    current_user: Admin | Teacher | Student = Depends(get_current_user)
) -> Admin:
    """Compatibility wrapper: ensures authenticated user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user