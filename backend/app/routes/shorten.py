from datetime import datetime, timezone
from urllib.parse import urlparse

from flask import Blueprint, current_app, g, jsonify, request

from app.extensions import db, redis_client
from app.models import ShortUrl
from app.utils.decorators import login_required, optional_auth
from app.utils.shortcode import generate_short_code

shorten_bp = Blueprint("shorten", __name__, url_prefix="/api/urls")

MAX_SHORT_CODE_ATTEMPTS = 5


def _is_valid_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except (ValueError, AttributeError):
        return False


def _parse_expires_at(value: str | None) -> datetime | None:
    """Parse an ISO date/datetime string into a tz-aware UTC datetime.

    Accepts both a bare date (from the frontend's <input type="date">,
    e.g. "2026-09-15") and a full ISO timestamp. A naive result is
    assumed to be UTC, since it's later compared against a tz-aware
    utcnow() in ShortUrl.is_expired().
    """
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _generate_unique_code() -> str:
    for _ in range(MAX_SHORT_CODE_ATTEMPTS):
        code = generate_short_code()
        if not ShortUrl.query.filter_by(short_code=code).first():
            return code
    raise RuntimeError("Could not generate a unique short code, please retry")


@shorten_bp.post("")
@optional_auth
def create_short_url():
    payload = request.get_json(silent=True) or {}
    original_url = (payload.get("url") or "").strip()
    custom_code = (payload.get("custom_code") or "").strip() or None
    title = (payload.get("title") or "").strip() or None
    expires_at = _parse_expires_at(payload.get("expires_at"))

    if not original_url:
        return jsonify({"error": "The 'url' field is required."}), 400

    if not _is_valid_url(original_url):
        return jsonify({"error": "Please provide a valid http(s) URL."}), 400

    if custom_code:
        if not custom_code.isalnum():
            return jsonify({"error": "Custom codes may only contain letters and numbers."}), 400
        if ShortUrl.query.filter_by(short_code=custom_code).first():
            return jsonify({"error": "That custom code is already taken."}), 409
        short_code = custom_code
    else:
        short_code = _generate_unique_code()

    short_url = ShortUrl(
        short_code=short_code,
        original_url=original_url,
        title=title,
        expires_at=expires_at,
        user_id=g.current_user.id if g.current_user else None,
    )
    db.session.add(short_url)
    db.session.commit()

    return jsonify(short_url.to_dict(current_app.config["BASE_URL"])), 201


@shorten_bp.get("")
@login_required
def list_short_urls():
    urls = (
        ShortUrl.query.filter_by(user_id=g.current_user.id)
        .order_by(ShortUrl.created_at.desc())
        .all()
    )
    base_url = current_app.config["BASE_URL"]
    return jsonify([url.to_dict(base_url) for url in urls])


@shorten_bp.get("/<string:short_code>")
@login_required
def get_short_url(short_code: str):
    short_url = ShortUrl.query.filter_by(
        short_code=short_code, user_id=g.current_user.id
    ).first()
    if not short_url:
        return jsonify({"error": "Short URL not found."}), 404
    return jsonify(short_url.to_dict(current_app.config["BASE_URL"]))


@shorten_bp.delete("/<string:short_code>")
@login_required
def delete_short_url(short_code: str):
    short_url = ShortUrl.query.filter_by(
        short_code=short_code, user_id=g.current_user.id
    ).first()
    if not short_url:
        return jsonify({"error": "Short URL not found."}), 404

    db.session.delete(short_url)
    db.session.commit()

    if redis_client:
        redis_client.delete(f"shorturl:{short_code}")

    return "", 204
