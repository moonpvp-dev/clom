"""Iteration 5 tests — Object-storage-backed image upload + public file serve.
Covers:
- POST /api/admin/upload auth (401 unauth, 400 bad mime, 413 oversize, 200 valid)
- GET /api/files/{path} public (no auth), correct mime + Cache-Control, 404 for missing
- Leave-In product image reverted to None
"""
import io
import os
import struct
import uuid
import zlib
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


def _make_png(width: int = 4, height: int = 4) -> bytes:
    """Build a minimal valid PNG byte stream — no Pillow dependency."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    raw = b""
    for _ in range(height):
        raw += b"\x00" + b"\xff\x00\x00" * width
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


@pytest.fixture(scope="module")
def png_bytes():
    return _make_png()


@pytest.fixture(scope="module")
def uploaded(png_bytes):
    """Upload once for the module; reuse path across GET tests."""
    files = {"file": ("test.png", png_bytes, "image/png")}
    r = requests.post(f"{API}/admin/upload", files=files, headers=ADMIN_HEADERS, timeout=60)
    if r.status_code == 503:
        pytest.skip(f"Object storage unavailable: {r.text}")
    assert r.status_code == 200, r.text
    return r.json()


# -------- Upload auth + validation --------
class TestUploadAuth:
    def test_upload_no_auth_returns_401(self, png_bytes):
        files = {"file": ("x.png", png_bytes, "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, timeout=30)
        assert r.status_code == 401

    def test_upload_wrong_token_returns_401(self, png_bytes):
        files = {"file": ("x.png", png_bytes, "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files,
                          headers={"Authorization": "Bearer wrong"}, timeout=30)
        assert r.status_code == 401

    def test_upload_bad_content_type_returns_400(self):
        files = {"file": ("x.txt", b"hello world", "text/plain")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=ADMIN_HEADERS, timeout=30)
        assert r.status_code == 400, r.text

    def test_upload_oversize_returns_413(self):
        # 9 MB blob, but content_type must pass first so use image/png header
        big = b"\x89PNG\r\n\x1a\n" + b"\x00" * (9 * 1024 * 1024)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=ADMIN_HEADERS, timeout=120)
        assert r.status_code == 413, r.text


class TestUploadSuccess:
    def test_upload_valid_png_returns_path_url_size(self, uploaded, png_bytes):
        assert isinstance(uploaded.get("path"), str) and uploaded["path"].endswith(".png")
        assert uploaded.get("url", "").startswith("/api/files/")
        assert uploaded.get("size") == len(png_bytes)


# -------- Public file serve --------
class TestPublicFiles:
    def test_get_uploaded_file_public_no_auth(self, uploaded, png_bytes):
        url = f"{BASE_URL}{uploaded['url']}"
        r = requests.get(url, timeout=30)  # No auth header
        assert r.status_code == 200, r.text
        assert r.headers.get("Content-Type", "").startswith("image/png")
        # Backend sets `public, max-age=31536000, immutable`, but Cloudflare ingress
        # rewrites it to `no-store, no-cache, must-revalidate`. The requirement only
        # asks that Cache-Control is present, so we keep this loose at the edge.
        assert "Cache-Control" in r.headers or "cache-control" in r.headers
        assert r.content == png_bytes

    def test_get_nonexistent_file_returns_404(self):
        bogus = f"curlloom/uploads/{uuid.uuid4()}.png"
        r = requests.get(f"{API}/files/{bogus}", timeout=30)
        assert r.status_code == 404, r.text


# -------- Leave-In product image regression --------
class TestLeaveInImageNone:
    def test_leave_in_image_is_none(self):
        r = requests.get(f"{API}/products/leave-in-conditioner", timeout=15)
        assert r.status_code == 200
        assert r.json().get("image") is None
