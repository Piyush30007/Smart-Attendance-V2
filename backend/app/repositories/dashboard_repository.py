from datetime import date
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.teacher import Teacher
from app.models.attendance import Attendance

class DashboardRepository:

    @staticmethod
    def total_students(db: Session) -> int:
        return db.query(Student).filter(Student.is_active == True).count()

    @staticmethod
    def registered_students(db: Session) -> int:
        return (
            db.query(Student)
            .filter(Student.is_active == True, Student.encoding_path.is_not(None))
            .count()
        )
        
    @staticmethod
    def active_students(db: Session) -> int:
        return db.query(Student).filter(Student.is_active == True).count()
    
    @staticmethod
    def inactive_students(db: Session) -> int:
        return db.query(Student).filter(Student.is_active == False).count()
    
    @staticmethod
    def total_teacher(db: Session) -> int:
        return db.query(Teacher).filter(Teacher.is_active == True).count()

    @staticmethod
    def present_today(db: Session) -> int:
        return (
            db.query(Attendance.id)
            .filter(Attendance.date == date.today(), Attendance.status == "present")
            .count()
        )

    