from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.database import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("student_id", "date", name="uq_student_per_day"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="present")  # present / late / absent
    confidence_score = Column(String(10), nullable=True)
    liveness_passed = Column(String(10), default="true")

    student = relationship("Student")
