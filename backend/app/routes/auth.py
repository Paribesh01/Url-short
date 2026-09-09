import re

from flask import Blueprint, g, jsonify, request

from app.extensions import db
from app.models import User
from app.utils.auth import generate_token
from app.utils.decorators import login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8


def _validate_credentials(email: str, password: str) -> str | None:
    if not email or not EMAIL_RE.match(email):
        return "Please provide a valid email address."
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    return None


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    error = _validate_credentials(email, password)
    if error:
        return jsonify({"error": error}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists."}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"token": generate_token(user.id), "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({"token": generate_token(user.id), "user": user.to_dict()})


@auth_bp.get("/me")
@login_required
def me():
    return jsonify(g.current_user.to_dict())
