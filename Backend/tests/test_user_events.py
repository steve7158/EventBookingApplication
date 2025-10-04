import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database.init_db import init_db
from app.core.security import create_access_token

init_db()
client = TestClient(app)


def _auth_header(user_id: str):
    token = create_access_token(user_id)
    return {"Authorization": f"Bearer {token}"}


def test_create_user_no_events():
    user_id = f"user-{uuid.uuid4()}"
    resp = client.post("/users/", json={"userId": user_id, "passwordHash": "hashed"})
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["id"] == user_id
    assert data["eventIds"] == []


def test_add_and_remove_events():
    user_id = f"user-{uuid.uuid4()}"
    # Create user
    client.post("/users/", json={"userId": user_id, "passwordHash": "hashed"})
    # Auth header
    headers = _auth_header(user_id)

    # Create event (need auth)
    event_payload = {
        "title": "Test Event",
        "description": "Desc",
        "category": "Cat",
        "maxAttendees": 100,
        "date": "2030-01-01",
        "startTime": "10:00:00",
        "endTime": "11:00:00"
    }
    er = client.post("/events/", json=event_payload, headers=headers)
    assert er.status_code == 201, er.text
    event_id = er.json()["id"]

    # Add event to user
    ur = client.put(f"/users/{user_id}/events", json={"addEventIds": [event_id]}, headers=headers)
    assert ur.status_code == 200, ur.text
    assert event_id in ur.json()["eventIds"]

    # Remove event
    ur2 = client.put(f"/users/{user_id}/events", json={"removeEventIds": [event_id]}, headers=headers)
    assert ur2.status_code == 200, ur2.text
    assert event_id not in ur2.json()["eventIds"]
