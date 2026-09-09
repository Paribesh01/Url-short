"""JWT issuing/verification for the token-based auth used by the API.

The frontend is a separate origin from the API, so sessions are kept
simple: a signed JWT is handed back on login/register, stored client
side, and sent back as `Authorization: Bearer <token>` on every
request that needs to know who's calling.
"""

from datetime import timedelta

import jwt
from flask import current_app

from app.models import utcnow

TOKEN_TTL = timedelta(days=30)


def generate_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "iat": utcnow(),
        "exp": utcnow() + TOKEN_TTL,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> int | None:
    """Return the user id encoded in a valid token, or None."""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None
