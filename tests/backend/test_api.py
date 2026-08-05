def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_list_students_empty(client):
    resp = client.get("/students")
    assert resp.status_code == 200
    assert resp.json() == []
