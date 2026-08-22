

from pydantic import BaseModel, ConfigDict , EmailStr
from typing import Optional 

class StudentCreate(BaseModel):
    student_code: str
    name: str
    email: EmailStr
    course: str

class StudentUpdate(BaseModel):
    name : str
    email : EmailStr
    course : str


class StudentOut(BaseModel):
    id: int
    student_code: str
    name: str
    email: Optional[EmailStr] = None
    course: Optional[str] = None
    profile_completed: bool = False
    model_config = ConfigDict(from_attributes=True)

