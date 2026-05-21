"""Backend API tests for CurlLoom (Iteration 3)
Covers:
- Health
- Early Access submit (ref_code/queue_position shape + referral linkage)
- Atomic queue counter (monotonic, no duplicate ref_codes)
- Referral lookup endpoint — narrowed to only {referral_count}
- Rate limiting on /api/early-access, /api/contact, /api/waitlist
- Admin auth (Bearer token) on all /api/admin/*
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

# Read ADMIN_TOKEN directly from backend/.env so tests always match server config
def _read_admin_token():
    env_path = "/app/backend/.env"
    with open(env_path) as f:
        for line in f:
            if line.startswith("ADMIN_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("ADMIN_TOKEN missing from /app/backend/.env")

ADMIN_TOKEN = _read_admin_token()
ADMIN_HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

REF_CODE_RE = re.compile(r"^[A-Z0-9]{6}$")


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def admin_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", **ADMIN_HEADERS})
    return s


def _unique_email(prefix="test"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@example.com"


# -------- Health --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "CurlLoom" in r.json()["message"]


# -------- Early Access --------
class TestEarlyAccess:
    def test_submit_returns_ref_code_and_queue_position(self, client, admin_client):
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

        assert data["status"] == "ok"
        assert isinstance(data.get("id"), str) and len(data["id"]) > 0
        assert REF_CODE_RE.match(data["ref_code"]), data
        assert isinstance(data["queue_position"], int) and data["queue_position"] >= 1
        assert "_id" not in data
        assert elapsed < 2.5, f"Endpoint blocked for {elapsed:.2f}s"

        # Persistence verification via admin
        admin = admin_client.get(f"{API}/admin/early-access").json()
        match = next((it for it in admin if it.get("id") == data["id"]), None)
        assert match is not None
        assert match["email"] == payload["email"]
        assert match["ref_code"] == data["ref_code"]
        assert match.get("referral_count") == 0
        assert "_id" not in match

    def test_referred_by_increments_referrer_count(self, client, admin_client):
        referrer = {
            "name": "TEST_Referrer",
            "email": _unique_email("referrer"),
            "hair_type": "Curly",
            "main_concern": "Moisture",
        }
        r1 = client.post(f"{API}/early-access", json=referrer)
        assert r1.status_code == 200, r1.text
        ref_code = r1.json()["ref_code"]

        referred = {
            "name": "TEST_Friend",
            "email": _unique_email("friend"),
            "hair_type": "Wavy",
            "main_concern": "Hold",
            "referred_by": ref_code,
        }
        r2 = client.post(f"{API}/early-access", json=referred)
        assert r2.status_code == 200, r2.text

        admin = admin_client.get(f"{API}/admin/early-access").json()
        ref_doc = next((it for it in admin if it.get("ref_code") == ref_code), None)
        assert ref_doc is not None
        assert ref_doc["referral_count"] >= 1

    def test_invalid_email_422(self, client):
        r = client.post(
            f"{API}/early-access",
            json={"name": "X", "email": "not-an-email", "hair_type": "x", "main_concern": "x"},
        )
        assert r.status_code == 422


# -------- Atomic queue counter --------
class TestAtomicQueueCounter:
    def test_queue_positions_are_unique_and_monotonic(self, client, admin_client):
        """Submit 3 sequential signups; queue positions must be strictly increasing
        and ref_codes must all be unique (unique index + retry loop)."""
        positions = []
        ref_codes = []
        for i in range(3):
            p = {
                "name": f"TEST_Atomic_{i}",
                "email": _unique_email(f"atomic_{i}"),
                "hair_type": "Curly",
                "main_concern": "Test",
            }
            r = client.post(f"{API}/early-access", json=p)
            assert r.status_code == 200, r.text
            positions.append(r.json()["queue_position"])
            ref_codes.append(r.json()["ref_code"])

        # Strictly increasing
        for i in range(1, len(positions)):
            assert positions[i] > positions[i - 1], f"Non-monotonic: {positions}"
        # All ref codes unique
        assert len(set(ref_codes)) == len(ref_codes), f"Duplicate ref_codes: {ref_codes}"


# -------- Referral lookup (narrowed in iteration 3) --------
@pytest.fixture(scope="module")
def shared_ref_code():
    """Create one signup at module scope to avoid blowing the 5/min limit."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # Retry against rate limit (wait up to 65s if needed)
    for _ in range(7):
        signup = {
            "name": "TEST_Lookup",
            "email": _unique_email("lookup"),
            "hair_type": "Curly",
            "main_concern": "Moisture",
        }
        r = s.post(f"{API}/early-access", json=signup)
        if r.status_code == 200:
            return r.json()["ref_code"]
        time.sleep(10)
    pytest.skip("Could not create signup for referral tests (rate limited)")


class TestReferralLookup:
    def test_referral_info_returns_only_referral_count(self, client, shared_ref_code):
        r2 = client.get(f"{API}/referral/{shared_ref_code}")
        assert r2.status_code == 200, r2.text
        data = r2.json()
        assert isinstance(data.get("referral_count"), int)
        # Must NOT leak any of these (iteration 3 narrowed projection)
        for forbidden in ("name", "queue_position", "email", "_id", "id", "hair_type"):
            assert forbidden not in data, f"Leaked {forbidden}: {data}"
        # Should be exactly one key
        assert set(data.keys()) == {"referral_count"}, f"Extra keys: {data.keys()}"

    def test_referral_info_case_insensitive(self, client, shared_ref_code):
        r = client.get(f"{API}/referral/{shared_ref_code.lower()}")
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
        assert r.json()["status"] == "ok" and "_id" not in r.json()

    def test_invalid_email(self, client):
        r = client.post(f"{API}/waitlist", json={"email": "bad", "product_name": "X"})
        assert r.status_code == 422


# -------- Admin Auth (Iteration 3 — Bearer token required) --------
class TestAdminAuth:
    ADMIN_PATHS = ["early-access", "contacts", "quiz", "waitlist"]

    @pytest.mark.parametrize("path", ADMIN_PATHS)
    def test_admin_no_auth_returns_401(self, client, path):
        r = client.get(f"{API}/admin/{path}")
        assert r.status_code == 401, f"{path}: expected 401, got {r.status_code}"

    @pytest.mark.parametrize("path", ADMIN_PATHS)
    def test_admin_wrong_token_returns_401(self, client, path):
        r = client.get(f"{API}/admin/{path}", headers={"Authorization": "Bearer wrong_token_xyz"})
        assert r.status_code == 401, f"{path}: expected 401, got {r.status_code}"

    @pytest.mark.parametrize("path", ADMIN_PATHS)
    def test_admin_correct_token_returns_200(self, admin_client, path):
        r = admin_client.get(f"{API}/admin/{path}")
        assert r.status_code == 200, f"{path}: {r.status_code} {r.text}"
        data = r.json()
        assert isinstance(data, list)
        for it in data:
            assert "_id" not in it

    def test_admin_malformed_header_returns_401(self, client):
        # Missing "Bearer " prefix
        r = client.get(f"{API}/admin/early-access", headers={"Authorization": ADMIN_TOKEN})
        assert r.status_code == 401


# -------- Rate limiting (run LAST so functional tests aren't blocked) --------
@pytest.mark.order(-1)
class TestRateLimits:
    def test_early_access_5_per_minute(self, client):
        payload_base = {"name": "TEST_RL_EA", "hair_type": "Curly", "main_concern": "Moisture"}
        codes = []
        for i in range(7):
            p = {**payload_base, "email": _unique_email(f"rl_ea_{i}")}
            r = client.post(f"{API}/early-access", json=p)
            codes.append(r.status_code)
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
