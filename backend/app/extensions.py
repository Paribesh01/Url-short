"""Shared extension instances, created here to avoid circular imports."""

import redis
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
redis_client: redis.Redis | None = None


def init_redis(redis_url: str) -> redis.Redis:
    """Create (or return) the module-level Redis client."""
    global redis_client
    redis_client = redis.from_url(redis_url, decode_responses=True)
    return redis_client
