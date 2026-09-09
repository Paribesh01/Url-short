from functools import wraps

from flask import g, jsonify, request

from app.models import User
from app.utils.auth import decode_token


def _load_user_from_request() -> User | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.removeprefix("Bearer ").strip()
    user_id = decode_token(token)
    if user_id is None:
        return None

    return User.query.get(user_id)


def login_required(view):
    """Reject the request unless a valid Bearer token maps to a real user."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _load_user_from_request()
        if user is None:
            return jsonify({"error": "Authentication required."}), 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


def optional_auth(view):
    """Attach the current user to `g` if a valid token is present, but
    don't reject the request if it's missing or invalid."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        g.current_user = _load_user_from_request()
        return view(*args, **kwargs)

    return wrapped
