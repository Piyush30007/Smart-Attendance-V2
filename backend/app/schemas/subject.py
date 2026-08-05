from pydantic import BaseModel


class SubjectBase(BaseModel):
    name: str


class SubjectOut(SubjectBase):
    id: int
