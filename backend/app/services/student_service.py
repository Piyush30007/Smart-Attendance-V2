"""Student service placeholder."""
""" Business logic for Student 
-Responsibilities:
-Create Student
-List Students
-Delete Student
-No SQL queries
-No HTTP exceptions

"""

from sqlalchemy.orm import Session
from app.models.student import Student
from app.repositories.student_repository import StudentRepository
from app.schemas.student import StudentCreate , StudentUpdate

class StudentService:
    @staticmethod
    def list_students(db: Session) -> list[Student]:
        """List all students in the database"""
        return StudentRepository.get_all(db)
    
    @staticmethod
    def create_student(db: Session, payload: StudentCreate) -> Student:
        """Create a new student in the database"""
        if StudentRepository.get_by_email(db, payload.email):
            raise ValueError("Email already exists")
        
        if StudentRepository.get_by_student_code(db, payload.student_code):
            raise ValueError("Student code already exists")
        
        profile_completed = (
            bool(payload.student_code)
            and bool(payload.name)
            and bool(payload.email)
            and bool(payload.course)
        )

        student = Student(
            name=payload.name,
            email=payload.email,
            course=payload.course,
            student_code=payload.student_code,
            profile_completed=profile_completed
        )
        return StudentRepository.create(db, student)

    @staticmethod
    def delete_student(db: Session, student_id: int) -> None:
        """Delete an existing student from the database"""
        student = StudentRepository.get_by_id(db, student_id)
        if not student:
            raise ValueError("Student not found")
        StudentRepository.delete(db, student)
            
    @staticmethod
    def update_student(db : Session , student_id : int , payload : StudentUpdate,)->Student:
        """Update An Existing Student"""
        student = StudentRepository.get_by_id(db , student_id)
        if not student :
            raise ValueError("Studen Not  Found")
        #check if another student already uses the email or not 
        existing = StudentRepository.get_by_email(db , payload.email)
        if existing and existing.id!=student_id:
            raise ValueError("Email Already Exists")
        
        return StudentRepository.update(db ,student , payload)
       