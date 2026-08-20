"""Fleet360 — Authentication Tests."""
import pytest


def test_register_user(client):
    resp = client.post("/api/v1/auth/register", json={
        "name": "New User",
        "email": "newuser@fleet360.in",
        "password": "Password123!",
        "role": "ANALYST",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@fleet360.in"
    assert data["role"] == "ANALYST"
    assert "hashed_password" not in data


def test_register_duplicate_email(client, admin_user):
    resp = client.post("/api/v1/auth/register", json={
        "name": "Dupe",
        "email": "testadmin@fleet360.in",
        "password": "Password123!",
        "role": "ANALYST",
    })
    assert resp.status_code == 409


def test_register_invalid_role(client):
    resp = client.post("/api/v1/auth/register", json={
        "name": "Bad Role",
        "email": "badrole@fleet360.in",
        "password": "Pass123!",
        "role": "SUPERUSER",
    })
    assert resp.status_code == 400


def test_login_success(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "testadmin@fleet360.in",
        "password": "TestPass123!",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "testadmin@fleet360.in",
        "password": "WrongPassword",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nobody@fleet360.in",
        "password": "Pass123!",
    })
    assert resp.status_code == 401


def test_me_endpoint(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "testadmin@fleet360.in"
    assert data["role"] == "ADMIN"


def test_me_no_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
