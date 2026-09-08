from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.database import Base, engine , SessionLocal
from app.api import attendance, auth, students , teachers
from app.routes import dashboard

from app.services.face_service import initialize_face_cache
from app.services.student_service import StudentService

settings = get_settings()
configure_logging(env=settings.ENV)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.

    Startup:
    - Load registered face embeddings from disk into RAM.
    - Warm up the face recognition cache.

    Shutdown:
    - FastAPI handles application cleanup.
    """

    print("[Startup] Initializing face recognition cache...")

    db = SessionLocal()

    try:
        initialize_face_cache(db)
        print("[Startup] Face recognition cache initialized successfully.")
    except Exception as e:
        print(f"[Startup] Face cache initialization failed: {e}")
    finally:
        db.close()

    yield # ->yield means that startup is finished now let fastapi run normally 

    print("[Shutdown] Smart Attendance API shutting down...")

# In production, prefer Alembic migrations over create_all().
# Base.metadata.create_all(bind=engine) 


app = FastAPI(
    title=settings.APP_NAME,
    description="Face-recognition based attendance system with JWT auth, "
                "liveness detection, and PostgreSQL-backed storage.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
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
    CORSMiddleware, #"Add the appropriate CORS headers to responses so browsers know which origins are allowed."
    allow_origins=settings.ALLOWED_ORIGINS.split(","),#split the list of allwed origin 
    allow_credentials=True,
    allow_methods=["*"], #allowing all the methods get put adn all 
    allow_headers=["*"], #allowing all the headers to be sent 
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(teachers.router)
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "env": settings.ENV}
