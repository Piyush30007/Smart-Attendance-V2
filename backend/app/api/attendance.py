import base64
from datetime import date
from typing import List, Optional
import time 
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
    total_start = time.perf_counter()    
    image_data = payload.image_base64

    if "," in image_data:
        image_data = image_data.split(",", 1)[1]
    t0 = time.perf_counter()
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
    decode_time = (time.perf_counter()-t0) * 1000 
    
    
    #1 liveness score check first 
    t0 = time.perf_counter() 
    is_live,score,error = is_liveness_pass(frame) 
    liveness_time = (time.perf_counter()-t0)*1000 
    if error:
        total_time = (time.perf_counter()-total_start)*1000
        msg = f"[AttendanceTime] Decode={decode_time:.2f}ms | Liveness={liveness_time:.2f}ms | Total={total_time:.2f}ms"
        print(msg)
        logger.info(msg)
        raise HTTPException(status_code=400 , detail = f"Liveness check failed: {error}")
    if not is_live:
        total_time = (time.perf_counter()-total_start)*1000
        msg = f"[AttendanceTime] Decode={decode_time:.2f}ms | Liveness={liveness_time:.2f}ms | Total={total_time:.2f}ms"
        print(msg)
        logger.info(msg)
        raise HTTPException(status_code=403, detail =  "Spoof detected. Please use a live face, not a photo or phone screen.")
    
    t0 = time.perf_counter()
    result = recognize_face(db, frame)
    recog_time = (time.perf_counter() - t0) * 1000
    recog_msg = f"[AttendanceTime] Recognition={recog_time:.2f}ms"
    print(recog_msg)
    logger.info(recog_msg)

    if result is None:
        total_time = (time.perf_counter() - total_start) * 1000
        fail_msg = (
            f"[AttendanceTime] Decode={decode_time:.2f}ms | Liveness={liveness_time:.2f}ms | "
            f"Recognition={recog_time:.2f}ms | Total={total_time:.2f}ms"
        )
        print(fail_msg)
        logger.info(fail_msg)
        raise HTTPException(
            status_code=404,
            detail="Face not recognized"
        )

    student = result["student"]
    confidence = result["similarity_score"]
    t0 = time.perf_counter() 
    record, already_marked = mark_attendance(
        db,
        student,
        confidence=confidence,
        liveness_passed=True
    )
    db_time = (time.perf_counter()-t0)*1000 
    total_time = (time.perf_counter()-total_start)*1000 
    summary_msg = (
        f"[AttendanceTime] Decode={decode_time:.2f}ms | Liveness={liveness_time:.2f}ms | "
        f"Recognition={recog_time:.2f}ms | DB={db_time:.2f}ms | Total={total_time:.2f}ms"
    )
    print(summary_msg)
    logger.info(summary_msg)
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
