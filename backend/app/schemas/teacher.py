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
    email: EmailStr
    department: str

    model_config = ConfigDict(from_attributes=True)