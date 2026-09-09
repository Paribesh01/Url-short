from datetime import datetime, timezone

from flask import Blueprint, abort, current_app, redirect, request

from app.extensions import cache_get, cache_set, db
from app.models import Click, ShortUrl
from app.utils.geo import lookup_geo
from app.utils.parse_agent import parse_client

redirect_bp = Blueprint("redirect", __name__)


def _client_ip() -> str | None:
    # Respect a reverse proxy's forwarded header if present, otherwise fall
    # back to the direct connection address.
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr


def _record_click(short_url: ShortUrl) -> None:
    ip_address = _client_ip()
    client_info = parse_client(request.headers.get("User-Agent"))
    geo_info = lookup_geo(ip_address)

    click = Click(
        short_url_id=short_url.id,
        referrer=request.referrer,
        ip_address=ip_address,
        user_agent=request.headers.get("User-Agent"),
        browser=client_info["browser"],
        os=client_info["os"],
        device_type=client_info["device_type"],
        country=geo_info["country"],
        city=geo_info["city"],
    )
    db.session.add(click)
    db.session.commit()


@redirect_bp.get("/<string:short_code>")
def redirect_to_original(short_code: str):
    cache_key = f"shorturl:{short_code}"
    original_url = cache_get(cache_key)

    short_url = None
    if not original_url:
        short_url = ShortUrl.query.filter_by(short_code=short_code).first()
        if not short_url:
            abort(404, description="Short URL not found.")

        if short_url.expires_at and short_url.expires_at < datetime.now(timezone.utc):
            abort(410, description="This short URL has expired.")

        original_url = short_url.original_url
        cache_set(cache_key, original_url, current_app.config["REDIRECT_CACHE_TTL"])

    # Tracking always hits the DB (need the row's id), so fetch it if the
    # redirect target itself came from cache.
    if short_url is None:
        short_url = ShortUrl.query.filter_by(short_code=short_code).first()

    if short_url:
        _record_click(short_url)

    return redirect(original_url, code=302)
