"""
Centralized application settings.
Everything here is read from environment variables so no secret,
DB URL, or model path is ever hardcoded in source.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings , SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
WORKSPACE_DIR = BACKEND_DIR.parent
DEFAULT_STORAGE_DIR = WORKSPACE_DIR / "storage"
if not DEFAULT_STORAGE_DIR.exists():
    DEFAULT_STORAGE_DIR = BACKEND_DIR / "storage"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Smart Attendance API"
    ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/smart_attendance"
    GOOGLE_CLIENT_ID : str
    # Redis (caching / sessions)
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Auth
    JWT_SECRET_KEY: str = "change-me-in-.env"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Face recognition
    FACE_MATCH_THRESHOLD: float = 0.55
    ENCODINGS_DIR: str = str(DEFAULT_STORAGE_DIR / "embeddings")
    WEIGHTS_DIR: str = str(DEFAULT_STORAGE_DIR / "weights")

    # Cloud storage (optional, for student images)
    USE_CLOUD_STORAGE: bool = False
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_S3_BUCKET: str | None = None
    AWS_REGION: str = "ap-south-1"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    


@lru_cache
def get_settings() -> Settings:
    return Settings()
