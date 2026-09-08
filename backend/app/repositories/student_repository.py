"""Repository layer for student
Responsibilities:
-Perform all database operations related to student
-No business logic
-No Password hashing
-No JWT handling
-No http exceptions
"""

from sqlalchemy.orm import Session

from app.models.student import Student
from app.schemas.student import StudentCreate , StudentUpdate

class StudentRepository:
    @staticmethod
    def get_by_id(db: Session, student_id: int) -> Student | None:
        return db.query(Student).filter(Student.id == student_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Student | None:
        return db.query(Student).filter(Student.email == email).first()

    @staticmethod 
    def get_by_student_code(db :Session , student_code:str) -> Student | None:
        """Get a student by student code from the database """
        return db.query(Student).filter(Student.student_code == student_code).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Student | None:
        """Get a student by username from the database """
        return db.query(Student).filter(Student.username == username).first()
    
    @staticmethod
    def get_all(db: Session) -> list[Student]:
        """Get all students from the database"""
        return db.query(Student).filter(Student.is_active==True).all()

    @staticmethod
    def create(db: Session, student: Student) -> Student:
        """Create a new student in the database"""
        db.add(student)
        db.commit()
        db.refresh(student)
        return student  
    

    @staticmethod
    def delete(db: Session, student: Student) -> None:
        """Delete an existing student from the database"""
        db.delete(student)
        db.commit()
        
#here we use static methods because we dont need to create an instancce of the repository class to use its methods. we can directly call the methods on the class itself. this is a common pattern in repository classes.
#without statice we should do something like def get_by_id(self) when we need to call it we should do something like StudentRepository().get_by_id(db, student_id) but with static we can do StudentRepository.get_by_id(db, student_id)

    @staticmethod
    def update(db : Session , student : Student , payload : StudentUpdate)->Student:
        student.name = payload.name 
        student.email = payload.email
        student.course = payload.course
        student.profile_completed = (
            bool(student.student_code)
            and bool(student.name)
            and bool(student.email)
            and bool(student.course)
        )
        
        db.commit()
        db.refresh(student)
        return student

    @staticmethod
    def update_encoding_path(db : Session , student : Student , encoding_path: str) -> Student:
        student.encoding_path = encoding_path
        db.commit()
        db.refresh(student)
        return student
        
    @staticmethod
    def get_students_with_face_embedding(db : Session )->list[Student] :
        return db.query(Student).filter(Student.encoding_path.is_not(None),Student.is_active == True).all()

    
