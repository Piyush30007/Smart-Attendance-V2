import base64
from datetime import date
from typing import List, Optional

import cv2
from fastapi import APIRouter, Depends, HTTPException
import numpy as np
from sqlalchemy.orm import Session

from ai.utils.insightface import verify_liveness
from app.core.logging import get_logger
from app.database.database import get_db
from app.models.attendance import Attendance
from app.schemas.attendance import (
    AttendanceOut,
    MarkAttendanceRequest,
    MarkAttendanceResponse,
)
from app.services.attendance_service import export_attendance_csv, mark_attendance
from app.services.face_service import recognize_face
from ai.spoof_detection.spoof import is_liveness_pass
router = APIRouter(prefix="/attendance", tags=["attendance"])
logger = get_logger(__name__)


@router.post("/mark", response_model=MarkAttendanceResponse)
def mark(
    payload: MarkAttendanceRequest,
    db: Session = Depends(get_db)
):
    image_data = payload.image_base64

    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    try:
        frame_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Base64 image"
        )

    frame = cv2.imdecode(
        np.frombuffer(frame_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )
    if frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image"
        )
    #1 liveness score check first 
    is_live,score,error = is_liveness_pass(frame) 
    if error :
        raise HTTPException(status_code=400 , detail = f"Liveness check failed: {error}")
    if not is_live:
        raise HTTPException(status_code=403, detail =  "Spoof detected. Please use a live face, not a photo or phone screen.")
    

    result = recognize_face(db, frame)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Face not recognized"
        )

    

    student = result["student"]
    confidence = result["similarity_score"]

    record, already_marked = mark_attendance(
        db,
        student,
        confidence=confidence,
        liveness_passed=True
    )

    logger.info(
        f"Attendance marked for student_id={student.id}"
    )

    return MarkAttendanceResponse(
        id=record.id,
        student_id=student.id,
        student_name=student.name,
        student_code=student.student_code,
        course=student.course,
        date=record.date,
        status=record.status,
        confidence_score=record.confidence_score,
        already_marked=already_marked,
        message=(
            "Attendance already marked today"
            if already_marked
            else "Attendance marked successfully"
        ),
    )


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
