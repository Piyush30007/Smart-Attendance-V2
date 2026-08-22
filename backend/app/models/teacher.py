from sqlalchemy import Column, Integer, String,Boolean, DateTime, func
from app.database.database import Base
from app.core.roles import UserRole

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)

    teacher_code = Column(String, unique=True, nullable=False)
    username = Column(String(80), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    role = Column(String(20), default=UserRole.TEACHER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    profile_completed = Column(
        Boolean,
        default=False,
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

      