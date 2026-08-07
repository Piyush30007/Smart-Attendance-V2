from sqlalchemy.orm import Session

from app.models.teacher import Teacher


class TeacherRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Teacher).all()

    @staticmethod
    def get_by_id(db: Session, teacher_id: int):
        return (
            db.query(Teacher)
            .filter(Teacher.id == teacher_id)
            .first()
        )

    @staticmethod
    def get_by_email(db: Session, email: str):
        return (
            db.query(Teacher)
            .filter(Teacher.email == email)
            .first()
        )

    @staticmethod
    def get_by_teacher_code(db: Session, teacher_code: str):
        return (
            db.query(Teacher)
            .filter(Teacher.teacher_code == teacher_code)
            .first()
        )

    @staticmethod
    def create(db: Session, teacher: Teacher):
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        return teacher

    @staticmethod
    def delete(db: Session, teacher: Teacher):
        db.delete(teacher)
        db.commit()