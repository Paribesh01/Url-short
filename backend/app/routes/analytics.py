from datetime import timedelta

from flask import Blueprint, g, jsonify, request
from sqlalchemy import func

from app.extensions import db
from app.models import Click, ShortUrl
from app.models import utcnow
from app.utils.decorators import login_required

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/urls")


def _get_owned_short_url(short_code: str) -> ShortUrl | None:
    return ShortUrl.query.filter_by(short_code=short_code, user_id=g.current_user.id).first()


def _top_counts(short_url_id: int, column, limit: int = 5) -> list[dict]:
    rows = (
        db.session.query(column, func.count(Click.id).label("count"))
        .filter(Click.short_url_id == short_url_id)
        .group_by(column)
        .order_by(func.count(Click.id).desc())
        .limit(limit)
        .all()
    )
    return [{"label": row[0] or "Unknown", "count": row[1]} for row in rows]


def _clicks_over_time(short_url_id: int, days: int) -> list[dict]:
    since = utcnow() - timedelta(days=days)
    day_bucket = func.date_trunc("day", Click.clicked_at)

    rows = (
        db.session.query(day_bucket.label("day"), func.count(Click.id).label("count"))
        .filter(Click.short_url_id == short_url_id, Click.clicked_at >= since)
        .group_by(day_bucket)
        .order_by(day_bucket)
        .all()
    )
    return [{"date": row.day.date().isoformat(), "count": row.count} for row in rows]


@analytics_bp.get("/<string:short_code>/analytics")
@login_required
def get_analytics(short_code: str):
    short_url = _get_owned_short_url(short_code)
    if not short_url:
        return jsonify({"error": "Short URL not found."}), 404

    days = request.args.get("days", default=30, type=int)
    recent_limit = request.args.get("recent_limit", default=20, type=int)

    recent_clicks = (
        short_url.clicks.order_by(Click.clicked_at.desc()).limit(recent_limit).all()
    )

    return jsonify(
        {
            "short_code": short_url.short_code,
            "original_url": short_url.original_url,
            "total_clicks": short_url.click_count(),
            "clicks_over_time": _clicks_over_time(short_url.id, days),
            "top_referrers": _top_counts(short_url.id, Click.referrer),
            "top_countries": _top_counts(short_url.id, Click.country),
            "top_browsers": _top_counts(short_url.id, Click.browser),
            "top_devices": _top_counts(short_url.id, Click.device_type),
            "recent_clicks": [click.to_dict() for click in recent_clicks],
        }
    )


@analytics_bp.get("/analytics/summary")
@login_required
def get_summary():
    """Aggregate stats across the current user's short URLs, for the dashboard overview."""
    owned_urls = ShortUrl.query.filter_by(user_id=g.current_user.id)
    total_urls = owned_urls.count()
    owned_url_ids = [url.id for url in owned_urls.with_entities(ShortUrl.id)]
    total_clicks = (
        Click.query.filter(Click.short_url_id.in_(owned_url_ids)).count()
        if owned_url_ids
        else 0
    )

    since = utcnow() - timedelta(days=30)
    day_bucket = func.date_trunc("day", Click.clicked_at)
    rows = (
        db.session.query(day_bucket.label("day"), func.count(Click.id).label("count"))
        .filter(Click.short_url_id.in_(owned_url_ids), Click.clicked_at >= since)
        .group_by(day_bucket)
        .order_by(day_bucket)
        .all()
        if owned_url_ids
        else []
    )

    return jsonify(
        {
            "total_urls": total_urls,
            "total_clicks": total_clicks,
            "clicks_over_time": [
                {"date": row.day.date().isoformat(), "count": row.count} for row in rows
            ],
        }
    )
