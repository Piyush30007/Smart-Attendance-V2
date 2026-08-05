import base64
import numpy as np
import cv2
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from app.database.database import get_db
from app.models.attendance import Attendance
from app.schemas.attendance import MarkAttendanceRequest, AttendanceOut
from app.services.face_service import get_face_embedding
from ai.recognition.recognizer import match_student
from app.services.attendance_service import mark_attendance, export_attendance_csv
from ai.utils.insightface import verify_liveness
from app.core.logging import get_logger

router = APIRouter(prefix="/attendance", tags=["attendance"])
logger = get_logger(__name__)


@router.post("/mark", response_model=AttendanceOut)
def mark(payload: MarkAttendanceRequest, db: Session = Depends(get_db)):
    frame_bytes = base64.b64decode(payload.image_base64)
    frame = cv2.imdecode(np.frombuffer(frame_bytes, np.uint8), cv2.IMREAD_COLOR)

    embedding = get_face_embedding(frame)
    if embedding is None:
        raise HTTPException(status_code=422, detail="No face detected in the frame")

    # Liveness gate — rejects a photo/video held up to the camera.
    if not verify_liveness([frame]):
        raise HTTPException(status_code=403, detail="Liveness check failed")

    student = match_student(db, embedding)
    if student is None:
        raise HTTPException(status_code=404, detail="Face not recognized")

    record = mark_attendance(db, student, confidence=1.0, liveness_passed=True)
    logger.info(f"Attendance marked for student_id={student.id}")
    return record


@router.get("/report")
def report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    csv_data = export_attendance_csv(db, start_date, end_date)
    return {"csv": csv_data}


@router.get("", response_model=List[AttendanceOut])
def list_attendance(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    return query.order_by(Attendance.date.desc()).all()
