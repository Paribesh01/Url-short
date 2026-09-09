"""Shared extension instances, created here to avoid circular imports."""

import logging

import redis
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
redis_client: redis.Redis | None = None

logger = logging.getLogger(__name__)


def init_redis(redis_url: str) -> redis.Redis:
    """Create (or return) the module-level Redis client."""
    global redis_client
    redis_client = redis.from_url(redis_url, decode_responses=True)
    return redis_client


def cache_get(key: str) -> str | None:
    """Read from Redis, treating any failure as a cache miss.

    redis-py connects lazily, so a misconfigured REDIS_URL or an
    unreachable Redis instance only surfaces here, as a raised
    ConnectionError — not at startup. The cache is an optimization, not
    a dependency: a broken cache should degrade to hitting Postgres on
    every redirect, not take the whole endpoint down with a 500.
    """
    if not redis_client:
        return None
    try:
        return redis_client.get(key)
    except redis.RedisError:
        logger.warning("Redis GET failed for %s; falling back to the database", key)
        return None


def cache_set(key: str, value: str, ttl_seconds: int) -> None:
    if not redis_client:
        return
    try:
        redis_client.setex(key, ttl_seconds, value)
    except redis.RedisError:
        logger.warning("Redis SETEX failed for %s; continuing without caching it", key)


def cache_delete(key: str) -> None:
    if not redis_client:
        return
    try:
        redis_client.delete(key)
    except redis.RedisError:
        logger.warning("Redis DELETE failed for %s; stale entry may linger until TTL", key)
