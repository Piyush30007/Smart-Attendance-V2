"""Student API endpoint .
Responsibilities:
-Receive HTTP requests 
-Validate request body
-Call StudentService for business logic
-Convert business errors to HTTP responses

"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.middleware.auth import get_current_admin
from app.models.admin import Admin
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentOut])

def list_students(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    return StudentService.list_students(db)

@router.post("",response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate , db:Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    try:
        return StudentService.create_student(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id : int , db:Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    try:
        StudentService.delete_student(db, student_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    
    
