"""Backend API tests for CurlLoom"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://curlloom-preview.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------- Health --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "CurlLoom" in data["message"]


# -------- Early Access --------
class TestEarlyAccess:
    def test_submit_full_payload(self, client):
        payload = {
            "name": "TEST_Jane",
            "email": "test_jane@example.com",
            "hair_type": "curly_3a",
            "main_concern": "frizz",
            "is_athlete": True,
            "interested_in_testing": True,
        }
        r = client.post(f"{API}/early-access", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        # verify _id not in response
        assert "_id" not in data

        # Verify persistence via admin endpoint
        r2 = client.get(f"{API}/admin/early-access")
        assert r2.status_code == 200
        items = r2.json()
        assert any(it.get("id") == data["id"] and it.get("email") == payload["email"] for it in items)
        for it in items:
            assert "_id" not in it

    def test_invalid_email_422(self, client):
        payload = {"name": "X", "email": "not-an-email", "hair_type": "x", "main_concern": "x"}
        r = client.post(f"{API}/early-access", json=payload)
        assert r.status_code == 422


# -------- Contact --------
class TestContact:
    def test_submit(self, client):
        payload = {"name": "TEST_C", "email": "test_contact@example.com",
                   "reason": "general", "message": "Hello from test"}
        r = client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok" and "id" in data
        assert "_id" not in data

        r2 = client.get(f"{API}/admin/contacts")
        assert r2.status_code == 200
        items = r2.json()
        assert any(it.get("id") == data["id"] for it in items)
        for it in items:
            assert "_id" not in it


# -------- Quiz --------
class TestQuiz:
    def test_submit_with_email(self, client):
        payload = {
            "email": "test_quiz@example.com",
            "hair_pattern": "3a",
            "porosity": "low",
            "biggest_issue": "frizz",
            "activity_level": "high",
            "product_feel": "lightweight",
            "has_perm": "no",
            "routine_type": "Athletic Curl Reset",
        }
        r = client.post(f"{API}/quiz", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        assert data["routine"] == "Athletic Curl Reset"
        assert "id" in data
        assert "_id" not in data

    def test_submit_without_email(self, client):
        payload = {
            "hair_pattern": "2b",
            "porosity": "medium",
            "biggest_issue": "buildup",
            "activity_level": "low",
            "product_feel": "rich",
            "has_perm": "yes",
            "routine_type": "Perm Care Set",
        }
        r = client.post(f"{API}/quiz", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        assert data["routine"] == "Perm Care Set"

    def test_admin_quiz(self, client):
        r = client.get(f"{API}/admin/quiz")
        assert r.status_code == 200
        for it in r.json():
            assert "_id" not in it


# -------- Waitlist --------
class TestWaitlist:
    def test_submit(self, client):
        payload = {"email": "test_wait@example.com", "product_name": "Leave-In Conditioner"}
        r = client.post(f"{API}/waitlist", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok" and "id" in data
        assert "_id" not in data

        r2 = client.get(f"{API}/admin/waitlist")
        assert r2.status_code == 200
        items = r2.json()
        assert any(it.get("id") == data["id"] and it.get("product_name") == "Leave-In Conditioner" for it in items)
        for it in items:
            assert "_id" not in it

    def test_invalid_email(self, client):
        r = client.post(f"{API}/waitlist", json={"email": "bad", "product_name": "X"})
        assert r.status_code == 422
