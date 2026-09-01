from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


class MarkAttendanceRequest(BaseModel):
    image_base64: str  # frame captured from the frontend camera


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    date: date
    check_in_time: datetime
    status: str
    confidence_score: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceReportQuery(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    student_code: Optional[str] = None

class MarkAttendanceResponse(BaseModel):
    id : int 
    student_id : int 
    student_name : str 
    student_code : str 
    course : Optional[str] = None 
    date : date 
    status : str 
    confidence_score : Optional[str] = None 
    already_marked : bool = False
    message : str 

    model_config = ConfigDict(
        from_attributes=True
    )