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
    def get_all(db: Session) -> list[Student]:
        """Get all students from the database"""
        return db.query(Student).all()

    @staticmethod
    def create(db: Session, student: Student) -> Student:
        """Create a new student in the database"""
        db.add(student)
        db.commit()
        db.refresh(student)
        return student  
    
    @staticmethod
    def update(db: Session, student: Student) -> Student:
        """Update an existing student in the database"""
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

