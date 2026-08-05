"""
CLI script for capturing/registering a new student's face.
Port your existing register_student.py logic here; have it call
app.services.face_service for detection/embedding instead of duplicating it,
and write directly to PostgreSQL via app.database.database.SessionLocal
instead of a separate SQLite connection.
"""
