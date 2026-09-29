import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "skillforge-super-secret-production-key-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "skillforge-jwt-secure-signing-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Support PostgreSQL with fallback to SQLite for immediate local execution
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'skillforge.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    CORS_HEADERS = "Content-Type"
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
