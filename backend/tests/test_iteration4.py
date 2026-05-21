"""Iteration 4 tests — Products CRUD + admin delete-submission.
Covers:
- GET /api/products (public, 6 seeded, sorted by sort_order, no _id)
- GET /api/products/{slug} 200 + 404
- POST/PUT/DELETE /api/admin/products (auth + 409 dup slug)
- DELETE /api/admin/{kind}/{item_id} for early-access/contacts/quiz/waitlist + unknown/missing
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

def _read_admin_token():
    with open("/app/backend/.env") as f:
        for line in f:
            if line.startswith("ADMIN_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("ADMIN_TOKEN missing")

ADMIN_TOKEN = _read_admin_token()
ADMIN_HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}


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


def _unique_email(p="test"):
    return f"TEST_{p}_{uuid.uuid4().hex[:8]}@example.com"


# -------- Public Products --------
class TestPublicProducts:
    def test_list_products_returns_at_least_6_sorted_no_id(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6, f"Expected >=6 products, got {len(data)}"
        # No _id leaked
        for p in data:
            assert "_id" not in p
            # schema essentials
            for k in ("slug", "name", "short", "status", "benefits", "ingredients", "sort_order"):
                assert k in p, f"Missing {k} in product: {p.get('slug')}"
            assert isinstance(p["benefits"], list)
            assert isinstance(p["ingredients"], list)
        # sorted ascending by sort_order
        sort_orders = [p["sort_order"] for p in data]
        assert sort_orders == sorted(sort_orders), f"Not sorted ascending: {sort_orders}"

    def test_seeded_slugs_present(self, client):
        r = client.get(f"{API}/products")
        slugs = {p["slug"] for p in r.json()}
        for s in ("leave-in-conditioner", "curl-cream", "gel", "mousse", "shampoo", "conditioner"):
            assert s in slugs, f"Missing seeded slug {s} in {slugs}"

    def test_get_leave_in_image_is_none_iter5(self, client):
        # Iter 5: image was reverted to None (CSS bottle placeholder)
        r = client.get(f"{API}/products/leave-in-conditioner")
        assert r.status_code == 200
        p = r.json()
        assert p["image"] is None
        assert "_id" not in p
        assert p["slug"] == "leave-in-conditioner"

    def test_get_nonexistent_returns_404(self, client):
        r = client.get(f"{API}/products/this-does-not-exist-xyz")
        assert r.status_code == 404


# -------- Admin Products CRUD --------
class TestAdminProducts:
    def test_create_without_auth_401(self, client):
        r = client.post(f"{API}/admin/products", json={
            "slug": "TEST_unauth", "name": "x", "short": "x"
        })
        assert r.status_code == 401

    def test_full_create_update_delete_flow(self, admin_client, client):
        slug = f"test-prod-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "name": "TEST Product",
            "short": "test short",
            "bestFor": "testing",
            "status": "Planned",
            "accent": "#123456",
            "image": "/x.png",
            "benefits": ["a", "b"],
            "who": "everyone",
            "feel": "smooth",
            "howTo": "apply",
            "ingredients": ["water"],
            "sort_order": 99,
        }
        # CREATE
        r = admin_client.post(f"{API}/admin/products", json=payload)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert "_id" not in doc
        assert doc["slug"] == slug
        assert doc["name"] == "TEST Product"
        assert "id" in doc

        # GET via public
        g = client.get(f"{API}/products/{slug}")
        assert g.status_code == 200
        assert g.json()["accent"] == "#123456"

        # DUPLICATE -> 409
        dup = admin_client.post(f"{API}/admin/products", json=payload)
        assert dup.status_code == 409, dup.text

        # UPDATE (same slug)
        upd_payload = {**payload, "name": "TEST Updated", "short": "new short"}
        u = admin_client.put(f"{API}/admin/products/{slug}", json=upd_payload)
        assert u.status_code == 200, u.text
        assert u.json()["name"] == "TEST Updated"
        assert u.json()["short"] == "new short"
        assert "_id" not in u.json()

        # Verify via GET
        g2 = client.get(f"{API}/products/{slug}").json()
        assert g2["name"] == "TEST Updated"

        # UPDATE with slug change to conflicting existing slug -> 409
        upd_conflict = {**upd_payload, "slug": "leave-in-conditioner"}
        c = admin_client.put(f"{API}/admin/products/{slug}", json=upd_conflict)
        assert c.status_code == 409

        # DELETE without auth -> 401
        d_no = client.delete(f"{API}/admin/products/{slug}")
        assert d_no.status_code == 401

        # DELETE with auth -> ok
        d = admin_client.delete(f"{API}/admin/products/{slug}")
        assert d.status_code == 200
        assert d.json().get("status") == "ok"

        # GET 404
        gone = client.get(f"{API}/products/{slug}")
        assert gone.status_code == 404

        # Re-DELETE -> 404
        again = admin_client.delete(f"{API}/admin/products/{slug}")
        assert again.status_code == 404

    def test_update_nonexistent_returns_404(self, admin_client):
        payload = {"slug": "nope-xyz", "name": "x", "short": "x"}
        r = admin_client.put(f"{API}/admin/products/nope-xyz-abc", json=payload)
        assert r.status_code == 404


# -------- Admin DELETE submission --------
class TestDeleteSubmissions:
    def test_delete_unknown_kind_404(self, admin_client):
        r = admin_client.delete(f"{API}/admin/not-a-kind/some-id")
        assert r.status_code == 404

    def test_delete_nonexistent_id_404(self, admin_client):
        r = admin_client.delete(f"{API}/admin/contacts/{uuid.uuid4()}")
        assert r.status_code == 404

    def test_delete_without_auth_401(self, client):
        r = client.delete(f"{API}/admin/contacts/{uuid.uuid4()}")
        assert r.status_code == 401

    def test_delete_contact_round_trip(self, client, admin_client):
        # Create contact
        payload = {
            "name": "TEST_DEL",
            "email": _unique_email("del_contact"),
            "reason": "general",
            "message": "delete me",
        }
        # contact has 5/min limit — fresh emails fine
        cr = client.post(f"{API}/contact", json=payload)
        assert cr.status_code == 200, cr.text
        cid = cr.json()["id"]
        # delete
        d = admin_client.delete(f"{API}/admin/contacts/{cid}")
        assert d.status_code == 200
        # verify gone
        lst = admin_client.get(f"{API}/admin/contacts").json()
        assert not any(it.get("id") == cid for it in lst)

    def test_delete_quiz_round_trip(self, client, admin_client):
        payload = {
            "email": _unique_email("del_quiz"),
            "hair_pattern": "3a", "porosity": "low", "biggest_issue": "frizz",
            "activity_level": "high", "product_feel": "lightweight",
            "has_perm": "no", "routine_type": "Athletic Curl Reset",
        }
        cr = client.post(f"{API}/quiz", json=payload)
        assert cr.status_code == 200
        qid = cr.json()["id"]
        d = admin_client.delete(f"{API}/admin/quiz/{qid}")
        assert d.status_code == 200

    def test_delete_waitlist_round_trip(self, client, admin_client):
        cr = client.post(f"{API}/waitlist", json={"email": _unique_email("del_w"), "product_name": "X"})
        assert cr.status_code == 200
        wid = cr.json()["id"]
        d = admin_client.delete(f"{API}/admin/waitlist/{wid}")
        assert d.status_code == 200

    def test_delete_early_access_round_trip(self, client, admin_client):
        # Try to create one with retry (5/min limit)
        eid = None
        for _ in range(7):
            r = client.post(f"{API}/early-access", json={
                "name": "TEST_DEL_EA", "email": _unique_email("del_ea"),
                "hair_type": "Curly", "main_concern": "x",
            })
            if r.status_code == 200:
                eid = r.json()["id"]
                break
            time.sleep(10)
        if not eid:
            pytest.skip("Could not create early-access entry (rate limited)")
        d = admin_client.delete(f"{API}/admin/early-access/{eid}")
        assert d.status_code == 200
