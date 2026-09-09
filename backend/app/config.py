import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration sourced from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql://user:password@localhost:5432/urlshort"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Serverless Postgres providers (e.g. Neon) can close idle connections
    # server-side; pre_ping detects and transparently replaces dead
    # connections instead of surfacing an OperationalError, and recycle
    # keeps the pool from holding a connection past the provider's idle limit.
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # Used to build the full short link (e.g. http://localhost:5000/abc123)
    BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000").rstrip("/")

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # How long a redirect lookup stays cached in Redis, in seconds
    REDIRECT_CACHE_TTL = int(os.environ.get("REDIRECT_CACHE_TTL", "3600"))
