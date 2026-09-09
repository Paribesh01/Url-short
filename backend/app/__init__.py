from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, init_redis


def create_app(config_class: type = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    init_redis(app.config["REDIS_URL"])
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    from app.routes.shorten import shorten_bp
    from app.routes.redirect import redirect_bp
    from app.routes.analytics import analytics_bp

    app.register_blueprint(shorten_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(redirect_bp)

    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app
