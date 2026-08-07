from sqlalchemy import Column, Integer, String

from app.database.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)

    teacher_code = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    department = Column(String, nullable=False)