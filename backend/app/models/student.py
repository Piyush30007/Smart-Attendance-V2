from sqlalchemy import Column, Integer, String,Boolean, DateTime, func
from app.database.database import Base
from app.core.roles import UserRole

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), unique=True, index=True, nullable=False)
    username = Column(String(80), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=True)
    course = Column(String(120), nullable=True)
    image_path = Column(String(255), nullable=True)   # local path or S3 key
    encoding_path = Column(String(255), nullable=True)  # path/key of stored embedding
    role = Column(String(20), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    profile_completed = Column(
        Boolean,
        default=False,
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
