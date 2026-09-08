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
    def get_student(db: Session, student_id: int) -> Student | None:
        """Get a student by ID"""
        return StudentRepository.get_by_id(db, student_id)
    
    @staticmethod
    def create_student(db: Session, payload: StudentCreate) -> Student:
        """Create a new student in the database"""
        if StudentRepository.get_by_email(db, payload.email):
            raise ValueError("Email already exists")
        
        if StudentRepository.get_by_student_code(db, payload.student_code):
            raise ValueError("Student code already exists")
        
        profile_completed = False

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
        
        # 1. Clean up face embedding from disk if it exists
        if student.encoding_path:
            import os
            if os.path.exists(student.encoding_path):
                try:
                    os.remove(student.encoding_path)
                except OSError:
                    pass
            student.encoding_path = None

        student.is_active = False
        db.commit()

        # 2. Remove from active face recognition RAM cache
        try:
            from app.services.face_service import recognizer
            recognizer.remove_embedding(student_id)
        except Exception:
            pass
            
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
       
    @staticmethod
    def get_registered_face_embeddings(db : Session)-> dict[int , str]:
        """Get All Registered Face Embeddings"""
        students = StudentRepository.get_students_with_face_embedding(db)
        return {s.id : s.encoding_path for s in students}