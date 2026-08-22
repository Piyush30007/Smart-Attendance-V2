from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class TeacherCreate(BaseModel):
    teacher_code: str
    name: str
    email: EmailStr
    department: str


class TeacherUpdate(BaseModel):
    name: str
    email: EmailStr
    department: str


class TeacherOut(BaseModel):
    id: int
    teacher_code: str
    name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    profile_completed: bool = False

    model_config = ConfigDict(from_attributes=True)