"""Security regression tests: demo login gating, production secrets, debug server, sign-up validation."""

import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app  # noqa: E402
from app.config import INSECURE_SECRETS, validate_production_config  # noqa: E402
from app.models import db  # noqa: E402
from app.seed_data import seed_database  # noqa: E402

STRONG = "x" * 48


def _client(config_name="development", **overrides):
    app = create_app(config_name)
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite:///:memory:", **overrides)
    with app.app_context():
        db.create_all()
        seed_database()
    return app.test_client()


@pytest.fixture
def prod_env(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", STRONG)
    monkeypatch.setenv("JWT_SECRET_KEY", STRONG + "j")
    import app.config as cfg

    monkeypatch.setattr(cfg.ProductionConfig, "SECRET_KEY", STRONG)
    monkeypatch.setattr(cfg.ProductionConfig, "JWT_SECRET_KEY", STRONG + "j")
    monkeypatch.setattr(cfg.ProductionConfig, "DEMO_MODE", False)


def test_demo_login_works_in_demo_mode():
    client = _client(DEMO_MODE=True)
    res = client.post("/api/auth/demo-login", json={"role": "admin"})
    assert res.status_code == 200 and res.get_json()["user"]["role"] == "admin"
    assert client.get("/api/health").get_json()["demo_mode"] is True


def test_demo_login_is_disabled_outside_demo_mode():
    client = _client(DEMO_MODE=False)
    for role in ("admin", "mentor", "student"):
        res = client.post("/api/auth/demo-login", json={"role": role})
        assert res.status_code == 404 and "token" not in res.get_json()
    assert client.get("/api/health").get_json()["demo_mode"] is False


def test_production_disables_demo_login_by_default(prod_env):
    client = _client("production")
    assert client.post("/api/auth/demo-login", json={"role": "admin"}).status_code == 404


def test_production_refuses_public_or_weak_secrets(monkeypatch):
    import app.config as cfg

    for secret in sorted(INSECURE_SECRETS) + ["short"]:
        monkeypatch.setattr(cfg.ProductionConfig, "SECRET_KEY", secret)
        monkeypatch.setattr(cfg.ProductionConfig, "JWT_SECRET_KEY", STRONG)
        with pytest.raises(RuntimeError, match="Refusing to start in production"):
            create_app("production")
    assert validate_production_config({"SECRET_KEY": STRONG, "JWT_SECRET_KEY": STRONG}) == []


def test_token_signed_with_old_public_key_is_rejected(prod_env):
    import jwt as pyjwt

    client = _client("production")
    forged = pyjwt.encode({"sub": "1", "type": "access"}, "skillforge-jwt-secure-signing-key-2026", algorithm="HS256")
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {forged}"})
    assert res.status_code in (401, 422)


def test_debug_server_is_not_exposed_by_default():
    source = open(os.path.join(os.path.dirname(__file__), "..", "run.py"), encoding="utf-8").read()
    assert "debug=True" not in source and "'0.0.0.0'" not in source


@pytest.mark.parametrize(
    ("payload", "fragment"),
    [
        ({"email": "not-an-email", "username": "new_user", "password": "longenough"}, "valid email"),
        ({"email": "a@b.co", "username": "x", "password": "longenough"}, "Username"),
        ({"email": "a@b.co", "username": "bad name!", "password": "longenough"}, "Username"),
        ({"email": "a@b.co", "username": "new_user", "password": "short"}, "at least 8"),
    ],
)
def test_registration_validation(payload, fragment):
    res = _client().post("/api/auth/register", json=payload)
    assert res.status_code == 400 and fragment in res.get_json()["error"]


def test_valid_registration_still_works():
    res = _client().post(
        "/api/auth/register", json={"email": "new@example.com", "username": "new.user", "password": "correct horse"}
    )
    assert res.status_code == 201 and "token" in res.get_json()


def test_blank_env_values_fall_back_to_defaults(monkeypatch):
    import importlib

    import app.config as cfg

    monkeypatch.setenv("SECRET_KEY", "")
    monkeypatch.setenv("JWT_SECRET_KEY", "")
    monkeypatch.setenv("SKILLFORGE_DEMO_MODE", "")
    reloaded = importlib.reload(cfg)
    try:
        assert reloaded.Config.SECRET_KEY == reloaded.DEV_SECRET_KEY
        assert reloaded.Config.JWT_SECRET_KEY == reloaded.DEV_JWT_SECRET_KEY
        assert reloaded.DevelopmentConfig.DEMO_MODE is True and reloaded.ProductionConfig.DEMO_MODE is False
    finally:
        monkeypatch.undo()
        importlib.reload(cfg)
