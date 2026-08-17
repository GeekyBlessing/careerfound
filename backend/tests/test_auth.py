import pytest

pytestmark = pytest.mark.asyncio


async def test_register_and_login(client):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "SecurePass123!", "full_name": "Test User"},
    )
    assert resp.status_code == 201
    tokens = resp.json()
    assert "access_token" in tokens

    resp = await client.post(
        "/api/v1/auth/login", json={"email": "test@example.com", "password": "SecurePass123!"}
    )
    assert resp.status_code == 200


async def test_register_duplicate_email_rejected(client):
    payload = {"email": "dupe@example.com", "password": "SecurePass123!", "full_name": "A"}
    resp1 = await client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201
    resp2 = await client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409


async def test_login_wrong_password_rejected(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wp@example.com", "password": "SecurePass123!", "full_name": "A"},
    )
    resp = await client.post("/api/v1/auth/login", json={"email": "wp@example.com", "password": "WrongPass!"})
    assert resp.status_code == 401


async def test_me_requires_auth(client):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


async def test_me_returns_profile_with_valid_token(client):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "me@example.com", "password": "SecurePass123!", "full_name": "Me User"},
    )
    token = resp.json()["access_token"]
    resp = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@example.com"
