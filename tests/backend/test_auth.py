def test_signup_and_login(client):
    signup_resp = client.post("/auth/signup", json={
        "username": "admin1", "email": "admin1@example.com", "password": "StrongPass123"
    })
    assert signup_resp.status_code == 201

    login_resp = client.post("/auth/login", json={
        "username": "admin1", "password": "StrongPass123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_login_wrong_password(client):
    client.post("/auth/signup", json={
        "username": "admin2", "email": "admin2@example.com", "password": "StrongPass123"
    })
    resp = client.post("/auth/login", json={"username": "admin2", "password": "wrong"})
    assert resp.status_code == 401
