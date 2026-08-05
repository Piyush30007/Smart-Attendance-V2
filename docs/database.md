# Database Notes

The current backend uses SQLAlchemy and defines its core models in:

- `backend/app/models/admin.py`
- `backend/app/models/student.py`
- `backend/app/models/attendance.py`

The `backend/app/database/` package contains the engine, session, and migration
scaffolding. Additional domain model files have been added so the database layer
matches the requested project layout.
