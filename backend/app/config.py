import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Development-only fallbacks. They are public (this repository is public), so anyone
# could forge a JWT with them: production refuses to start while they are in use.
DEV_SECRET_KEY = "dev-only-insecure-secret-key"
DEV_JWT_SECRET_KEY = "dev-only-insecure-jwt-key"
INSECURE_SECRETS = {
    DEV_SECRET_KEY,
    DEV_JWT_SECRET_KEY,
    # Previously committed defaults: treat them as leaked.
    "skillforge-super-secret-production-key-2026",
    "skillforge-jwt-secure-signing-key-2026",
}


def _env_flag(name, default):
    value = os.environ.get(name, "").strip()
    if not value:  # unset or blank (as in .env.example) means "use the default"
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


class Config:
    # `or`, not a get() default: a blank SECRET_KEY= line in .env must not become an empty key.
    SECRET_KEY = os.environ.get("SECRET_KEY") or DEV_SECRET_KEY
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or DEV_JWT_SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Support PostgreSQL with fallback to SQLite for immediate local execution
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'skillforge.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    CORS_HEADERS = "Content-Type"
    JSON_SORT_KEYS = False

    # One-click demo accounts (including admin) for local demos. Never on by default in production.
    DEMO_MODE = _env_flag("SKILLFORGE_DEMO_MODE", True)

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    DEMO_MODE = _env_flag("SKILLFORGE_DEMO_MODE", False)


def validate_production_config(config):
    """Refuse to run production with public secrets; return the list of problems."""
    problems = []
    for name in ("SECRET_KEY", "JWT_SECRET_KEY"):
        value = config.get(name) or ""
        if value in INSECURE_SECRETS:
            problems.append(f"{name} is a public default; set a random value in the environment")
        elif len(value) < 32:
            problems.append(f"{name} must be at least 32 characters")
    return problems

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
