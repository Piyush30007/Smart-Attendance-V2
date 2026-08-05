from datetime import date
from app.models.student import Student
from app.services.attendance_service import mark_attendance


def test_mark_attendance_idempotent(db_session):
    student = Student(student_code="102", name="Jane Smith")
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    first = mark_attendance(db_session, student, confidence=0.9, liveness_passed=True)
    second = mark_attendance(db_session, student, confidence=0.95, liveness_passed=True)

    # Same student, same day -> should return the same record, not a duplicate
    assert first.id == second.id
    assert first.date == date.today()
