from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    urls = db.relationship("ShortUrl", backref="owner", lazy="dynamic")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {"id": self.id, "email": self.email, "created_at": self.created_at.isoformat()}


class ShortUrl(db.Model):
    __tablename__ = "short_urls"

    id = db.Column(db.Integer, primary_key=True)
    short_code = db.Column(db.String(16), unique=True, nullable=False, index=True)
    original_url = db.Column(db.Text, nullable=False)
    title = db.Column(db.String(255), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=True)

    clicks = db.relationship(
        "Click", backref="short_url", lazy="dynamic", cascade="all, delete-orphan"
    )

    def click_count(self) -> int:
        return self.clicks.count()

    def is_expired(self) -> bool:
        return bool(self.expires_at and self.expires_at < utcnow())

    def to_dict(self, base_url: str) -> dict:
        return {
            "id": self.id,
            "short_code": self.short_code,
            "short_url": f"{base_url}/{self.short_code}",
            "original_url": self.original_url,
            "title": self.title,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_expired": self.is_expired(),
            "click_count": self.click_count(),
        }


class Click(db.Model):
    __tablename__ = "clicks"

    id = db.Column(db.Integer, primary_key=True)
    short_url_id = db.Column(
        db.Integer, db.ForeignKey("short_urls.id"), nullable=False, index=True
    )

    clicked_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    referrer = db.Column(db.String(512), nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(512), nullable=True)

    browser = db.Column(db.String(64), nullable=True)
    os = db.Column(db.String(64), nullable=True)
    device_type = db.Column(db.String(32), nullable=True)

    country = db.Column(db.String(128), nullable=True)
    city = db.Column(db.String(128), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "clicked_at": self.clicked_at.isoformat(),
            "referrer": self.referrer,
            "browser": self.browser,
            "os": self.os,
            "device_type": self.device_type,
            "country": self.country,
            "city": self.city,
        }
