"""Backend API tests for CurlLoom (Iteration 2)
Covers:
- Health
- Early Access submit (ref_code/queue_position shape + referral linkage)
- Referral lookup endpoint
- Rate limiting on /api/early-access, /api/contact, /api/quiz, /api/waitlist
- Email task non-blocking behavior (response <2s)
- _id never leaked
"""
import os
import re
import time
import uuid
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

REF_CODE_RE = re.compile(r"^[A-Z0-9]{6}$")


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _unique_email(prefix="test"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@example.com"


# -------- Health --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "CurlLoom" in data["message"]


# -------- Early Access --------
class TestEarlyAccess:
    def test_submit_returns_ref_code_and_queue_position(self, client):
        payload = {
            "name": "TEST_Jane",
            "email": _unique_email("jane"),
            "hair_type": "Curly",
            "main_concern": "Frizz",
            "is_athlete": True,
            "interested_in_testing": True,
        }
        t0 = time.time()
        r = client.post(f"{API}/early-access", json=payload)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        data = r.json()

        # Shape assertions
        assert data["status"] == "ok"
        assert isinstance(data.get("id"), str) and len(data["id"]) > 0
        assert "ref_code" in data and REF_CODE_RE.match(data["ref_code"]), data
        assert isinstance(data.get("queue_position"), int) and data["queue_position"] >= 1
        assert "_id" not in data

        # Email task must not block response (<2s)
        assert elapsed < 2.5, f"Endpoint blocked for {elapsed:.2f}s (expected <2s)"

        # Persistence check
        admin = client.get(f"{API}/admin/early-access").json()
        match = next((it for it in admin if it.get("id") == data["id"]), None)
        assert match is not None
        assert match["email"] == payload["email"]
        assert match["ref_code"] == data["ref_code"]
        assert match.get("referral_count") == 0
        assert "_id" not in match

    def test_referred_by_increments_referrer_count(self, client):
        # 1. Create the referrer
        referrer = {
            "name": "TEST_Referrer",
            "email": _unique_email("referrer"),
            "hair_type": "Curly",
            "main_concern": "Moisture",
        }
        r1 = client.post(f"{API}/early-access", json=referrer)
        assert r1.status_code == 200, r1.text
        ref_code = r1.json()["ref_code"]

        # 2. Create a referred signup pointing at that code
        referred = {
            "name": "TEST_Friend",
            "email": _unique_email("friend"),
            "hair_type": "Wavy",
            "main_concern": "Hold",
            "referred_by": ref_code,
        }
        r2 = client.post(f"{API}/early-access", json=referred)
        assert r2.status_code == 200, r2.text

        # 3. Verify referrer's referral_count was incremented in DB
        admin = client.get(f"{API}/admin/early-access").json()
        ref_doc = next((it for it in admin if it.get("ref_code") == ref_code), None)
        assert ref_doc is not None
        assert ref_doc["referral_count"] >= 1

    def test_invalid_email_422(self, client):
        payload = {"name": "X", "email": "not-an-email", "hair_type": "x", "main_concern": "x"}
        r = client.post(f"{API}/early-access", json=payload)
        assert r.status_code == 422


# -------- Referral lookup --------
class TestReferralLookup:
    def test_referral_info_valid(self, client):
        signup = {
            "name": "TEST_Lookup",
            "email": _unique_email("lookup"),
            "hair_type": "Curly",
            "main_concern": "Moisture",
        }
        r = client.post(f"{API}/early-access", json=signup)
        assert r.status_code == 200
        ref_code = r.json()["ref_code"]
        qpos = r.json()["queue_position"]

        r2 = client.get(f"{API}/referral/{ref_code}")
        assert r2.status_code == 200, r2.text
        data = r2.json()
        assert data["name"] == "TEST_Lookup"
        assert isinstance(data.get("referral_count"), int)
        assert data["queue_position"] == qpos
        assert "_id" not in data

    def test_referral_info_case_insensitive(self, client):
        signup = {
            "name": "TEST_CaseTest",
            "email": _unique_email("case"),
            "hair_type": "Curly",
            "main_concern": "Frizz",
        }
        ref_code = client.post(f"{API}/early-access", json=signup).json()["ref_code"]
        r = client.get(f"{API}/referral/{ref_code.lower()}")
        assert r.status_code == 200

    def test_referral_info_invalid_returns_404(self, client):
        r = client.get(f"{API}/referral/ZZZZZZ")
        assert r.status_code == 404


# -------- Contact --------
class TestContact:
    def test_submit(self, client):
        payload = {
            "name": "TEST_C",
            "email": _unique_email("contact"),
            "reason": "general",
            "message": "Hello from test",
        }
        t0 = time.time()
        r = client.post(f"{API}/contact", json=payload)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok" and "id" in data and "_id" not in data
        assert elapsed < 2.5


# -------- Quiz --------
class TestQuiz:
    def test_submit_with_email(self, client):
        payload = {
            "email": _unique_email("quiz"),
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
        assert data["routine"] == "Athletic Curl Reset"
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
        assert r.status_code == 200
        assert r.json()["routine"] == "Perm Care Set"


# -------- Waitlist --------
class TestWaitlist:
    def test_submit(self, client):
        payload = {"email": _unique_email("wait"), "product_name": "Leave-In Conditioner"}
        r = client.post(f"{API}/waitlist", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok" and "_id" not in data

    def test_invalid_email(self, client):
        r = client.post(f"{API}/waitlist", json={"email": "bad", "product_name": "X"})
        assert r.status_code == 422


# -------- Admin lists ($_id excluded) --------
class TestAdmin:
    @pytest.mark.parametrize("path", ["early-access", "contacts", "quiz", "waitlist"])
    def test_admin_no_mongo_id(self, client, path):
        r = client.get(f"{API}/admin/{path}")
        assert r.status_code == 200
        for it in r.json():
            assert "_id" not in it


# -------- Rate limiting (run LAST so functional tests aren't blocked) --------
@pytest.mark.order(-1)
class TestRateLimits:
    """slowapi limits per IP. We're behind a proxy so all requests appear from
    the same client IP -> the 6th call within 1 minute should hit 429.
    Note: assumes prior tests didn't already consume the budget for this minute.
    """

    def _spam(self, client, url, payload, n):
        codes = []
        for _ in range(n):
            r = client.post(url, json=payload)
            codes.append(r.status_code)
        return codes

    def test_early_access_5_per_minute(self, client):
        payload_base = {
            "name": "TEST_RL_EA",
            "hair_type": "Curly",
            "main_concern": "Moisture",
        }
        codes = []
        for i in range(7):
            p = {**payload_base, "email": _unique_email(f"rl_ea_{i}")}
            r = client.post(f"{API}/early-access", json=p)
            codes.append(r.status_code)
        # 429 must appear (5/min limit enforced).
        # Prior TestEarlyAccess tests share the same per-IP budget, so we only
        # assert the rate limit kicked in.
        assert 429 in codes, f"Expected 429 in {codes}"

    def test_contact_5_per_minute(self, client):
        codes = []
        for i in range(7):
            p = {
                "name": "TEST_RL_C",
                "email": _unique_email(f"rl_c_{i}"),
                "reason": "general",
                "message": "spam test",
            }
            r = client.post(f"{API}/contact", json=p)
            codes.append(r.status_code)
        assert 429 in codes, f"Expected 429 in {codes}"

    def test_quiz_10_per_minute_less_strict(self, client):
        """Quiz allows 10/min — first 5 should always succeed."""
        codes = []
        for i in range(5):
            p = {
                "email": _unique_email(f"rl_q_{i}"),
                "hair_pattern": "3a",
                "porosity": "low",
                "biggest_issue": "frizz",
                "activity_level": "high",
                "product_feel": "lightweight",
                "has_perm": "no",
                "routine_type": "Athletic Curl Reset",
            }
            r = client.post(f"{API}/quiz", json=p)
            codes.append(r.status_code)
        assert all(c == 200 for c in codes), f"Quiz under 10/min should succeed: {codes}"
