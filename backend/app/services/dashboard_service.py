from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_stats(db: Session):
        total_students = DashboardRepository.total_students(db)
        present = DashboardRepository.present_today(db)
        absent = max(0, total_students - present)

        return {
            "students": total_students,
            "teachers": DashboardRepository.total_teacher(db),
            "subjects": 0,
            "present": present,
            "absent": absent,
        }