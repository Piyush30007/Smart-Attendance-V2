from sqlalchemy.orm import Session

from app.models.student import Student


class DashboardRepository:

    @staticmethod
    def total_students(db: Session):
        return db.query(Student).count()