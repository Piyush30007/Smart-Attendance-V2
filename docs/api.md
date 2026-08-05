# API Notes

Current active FastAPI routes live under `backend/app/api/`.

- `auth.py`: login, signup, refresh, logout.
- `students.py`: list, create, and delete students.
- `attendance.py`: mark attendance, list attendance, and export CSV reports.

Additional route modules such as `teachers.py`, `reports.py`, `dashboard.py`,
`subjects.py`, and `settings.py` are now scaffolded so the backend layout
matches the larger project structure.
