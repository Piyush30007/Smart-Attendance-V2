from sqlalchemy.orm import Session

from app.models.attendance import Attendance


def list_attendance(db: Session) -> list[Attendance]:
    return db.query(Attendance).all()
