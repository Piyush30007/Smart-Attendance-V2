from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.database import Base, engine
from app.api import attendance, auth, students , teachers
from app.routes import dashboard
settings = get_settings()
configure_logging(settings.ENV)

# In production, prefer Alembic migrations over create_all().
# Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    description="Face-recognition based attendance system with JWT auth, "
                "liveness detection, and PostgreSQL-backed storage.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Attendance API",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "Running"
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(teachers.router)
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "env": settings.ENV}
