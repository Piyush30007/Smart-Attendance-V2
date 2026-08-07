from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_stats(db: Session):

        return {
            "students": DashboardRepository.total_students(db),

            "teachers": 0,

            "subjects": 0,

            "present": 0,

            "absent": 0,
        }