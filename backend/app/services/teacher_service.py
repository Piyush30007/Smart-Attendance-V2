from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.repositories.teacher_repository import TeacherRepository
from app.schemas.teacher import TeacherCreate, TeacherUpdate


class TeacherService:

    @staticmethod
    def list_teachers(db: Session):
        return TeacherRepository.get_all(db)

    @staticmethod
    def create_teacher(db: Session, payload: TeacherCreate):

        if TeacherRepository.get_by_email(db, payload.email):
            raise ValueError("Email already exists")

        if TeacherRepository.get_by_teacher_code(
            db,
            payload.teacher_code,
        ):
            raise ValueError("Teacher code already exists")

        teacher = Teacher(
            teacher_code=payload.teacher_code,
            name=payload.name,
            email=payload.email,
            department=payload.department,
        )

        return TeacherRepository.create(db, teacher)

    @staticmethod
    def delete_teacher(db: Session, teacher_id: int):

        teacher = TeacherRepository.get_by_id(db, teacher_id)

        if not teacher:
            raise ValueError("Teacher not found")

        TeacherRepository.delete(db, teacher)

    @staticmethod
    def update_teacher(
        db: Session,
        teacher_id: int,
        payload: TeacherUpdate,
    ):

        teacher = TeacherRepository.get_by_id(db, teacher_id)

        if not teacher:
            raise ValueError("Teacher not found")

        teacher.name = payload.name
        teacher.email = payload.email
        teacher.department = payload.department

        db.commit()
        db.refresh(teacher)

        return teacher