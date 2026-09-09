"""Minimal, idempotent schema patching for columns added after the
initial `db.create_all()`.

This project doesn't use Alembic/Flask-Migrate — `create_all()` covers
brand-new tables, but it never alters an existing table, so a column
added to a model later (like ShortUrl.user_id) needs to be added to
already-provisioned databases by hand. Kept intentionally small: add
an entry here each time a column is added to an existing table.
"""

from sqlalchemy import inspect, text

from app.extensions import db


def sync_schema() -> None:
    inspector = inspect(db.engine)
    if "short_urls" not in inspector.get_table_names():
        # Fresh database — create_all() already produced the current schema.
        return

    columns = {col["name"] for col in inspector.get_columns("short_urls")}

    with db.engine.begin() as conn:
        if "user_id" not in columns:
            conn.execute(
                text(
                    "ALTER TABLE short_urls "
                    "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                )
            )
            conn.execute(
                text("CREATE INDEX IF NOT EXISTS ix_short_urls_user_id ON short_urls (user_id)")
            )
