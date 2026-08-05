"""
Business logic for marking and reporting attendance.
Keeps the "one record per student per day" rule and CSV export
in one place instead of scattered across scripts.
"""
import csv
import io
from datetime import date
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.student import Student


def mark_attendance(db: Session, student: Student, confidence: float, liveness_passed: bool) -> Attendance:
    today = date.today()
    existing = (
        db.query(Attendance)
        .filter(Attendance.student_id == student.id, Attendance.date == today)
        .first()
    )
    if existing:
        return existing  # already marked today — idempotent

    record = Attendance(
        student_id=student.id,
        date=today,
        status="present",
        confidence_score=str(round(confidence, 4)),
        liveness_passed=str(liveness_passed).lower(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def export_attendance_csv(db: Session, start_date: date, end_date: date) -> str:
    """Generates a CSV export on demand — CSV is a view, not the source of truth."""
    rows = (
        db.query(Attendance)
        .filter(Attendance.date >= start_date, Attendance.date <= end_date)
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["student_id", "date", "check_in_time", "status", "confidence_score"])
    for r in rows:
        writer.writerow([r.student_id, r.date, r.check_in_time, r.status, r.confidence_score])

    return buffer.getvalue()
