from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=True)
    course = Column(String(120), nullable=True)
    image_path = Column(String(255), nullable=True)   # local path or S3 key
    encoding_path = Column(String(255), nullable=True)  # path/key of stored embedding
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
