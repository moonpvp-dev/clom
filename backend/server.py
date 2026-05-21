from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import asyncio
import logging
import secrets
import string
import resend
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="CurlLoom API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Background task registry (prevents GC of fire-and-forget tasks)
_BG: set = set()
def _spawn(coro):
    t = asyncio.create_task(coro)
    _BG.add(t)
    t.add_done_callback(_BG.discard)
    return t


def _make_ref_code(n: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


# -------- Models --------
class EarlyAccessIn(BaseModel):
    name: str
    email: EmailStr
    hair_type: str
    main_concern: str
    is_athlete: bool = False
    interested_in_testing: bool = False
    referred_by: Optional[str] = None

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    reason: str
    message: str

class QuizIn(BaseModel):
    email: Optional[EmailStr] = None
    hair_pattern: str
    porosity: str
    biggest_issue: str
    activity_level: str
    product_feel: str
    has_perm: str
    routine_type: str

class WaitlistIn(BaseModel):
    email: EmailStr
    product_name: str


# -------- Email --------
def _wrap(title: str, body: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#121217;border-radius:24px;padding:48px 40px;color:#FAFAFA;">
          <tr><td style="padding-bottom:24px;">
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#FFFFFF;">
              Curl<span style="color:#8B5CF6;">Loom</span>
            </div>
          </td></tr>
          <tr><td style="font-size:24px;font-weight:700;color:#FAFAFA;padding-bottom:16px;">{title}</td></tr>
          <tr><td style="font-size:15px;line-height:1.6;color:#A1A1AA;">{body}</td></tr>
          <tr><td style="padding-top:32px;font-size:12px;color:#52525B;border-top:1px solid #27272A;padding-top:24px;margin-top:24px;">
            CurlLoom &middot; help@curlloom.co<br/>
            Cosmetic products only — not intended to diagnose, treat, cure, or prevent any disease.
          </td></tr>
        </table>
      </td></tr>
    </table>
    """

async def send_email(to: str, subject: str, html: str):
    if not resend.api_key:
        return None
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        # Tight timeout so retries / rate limits cannot stack forever
        return await asyncio.wait_for(asyncio.to_thread(resend.Emails.send, params), timeout=10)
    except asyncio.TimeoutError:
        logger.error(f"Email timed out to {to}")
        return None
    except Exception as e:
        logger.error(f"Email failed to {to}: {e}")
        return None


# -------- Routes --------
@api_router.get("/")
async def root():
    return {"message": "CurlLoom API live"}


@api_router.post("/early-access")
@limiter.limit("5/minute")
async def early_access(request: Request, payload: EarlyAccessIn):
    ref_code = _make_ref_code()
    # Ensure uniqueness (cheap loop)
    while await db.early_access.find_one({"ref_code": ref_code}, {"_id": 1}):
        ref_code = _make_ref_code()

    # Count current signups for queue position
    total = await db.early_access.count_documents({}) + 1

    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "ref_code": ref_code,
        "referral_count": 0,
        "queue_position": total,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.early_access.insert_one(dict(doc))

    # If they were referred, bump the referrer
    if payload.referred_by:
        await db.early_access.update_one(
            {"ref_code": payload.referred_by.upper()},
            {"$inc": {"referral_count": 1}},
        )

    html = _wrap(
        f"You're #{total} on the list, {payload.name}.",
        f"""<p>Thanks for joining CurlLoom early access. We're building lightweight, low-buildup curl care for real routines — and you'll be one of the first to hear when products are ready for testing.</p>
        <p style="margin-top:24px;padding:16px;background:#1a1a20;border-radius:12px;border:1px solid #27272A;">
          <strong style="color:#FAFAFA;">Founders Circle:</strong> Share your code <strong style="color:#8B5CF6;font-size:18px;">{ref_code}</strong> with friends. Every signup using your code moves you up the queue and earns Founders Circle status at launch.
        </p>
        <p style="margin-top:8px;font-size:13px;color:#71717a;">Your link: <span style="color:#A78BFA;">curlloom.co/?ref={ref_code}</span></p>
        <p style="margin-top:24px;">Your preferences:</p>
        <ul style="color:#A1A1AA;line-height:1.8;">
          <li>Hair type: <span style="color:#FAFAFA;">{payload.hair_type}</span></li>
          <li>Main concern: <span style="color:#FAFAFA;">{payload.main_concern}</span></li>
          <li>Active lifestyle: <span style="color:#FAFAFA;">{'Yes' if payload.is_athlete else 'No'}</span></li>
          <li>Interested in testing: <span style="color:#FAFAFA;">{'Yes' if payload.interested_in_testing else 'No'}</span></li>
        </ul>
        <p>Talk soon,<br/>The CurlLoom team</p>"""
    )
    _spawn(send_email(payload.email, "Welcome to CurlLoom early access", html))
    return {"status": "ok", "id": doc["id"], "ref_code": ref_code, "queue_position": total}


@api_router.get("/referral/{code}")
async def referral_info(code: str):
    doc = await db.early_access.find_one({"ref_code": code.upper()}, {"_id": 0, "name": 1, "referral_count": 1, "queue_position": 1})
    if not doc:
        raise HTTPException(404, "Code not found")
    return doc


@api_router.post("/contact")
@limiter.limit("5/minute")
async def contact(request: Request, payload: ContactIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(dict(doc))

    html = _wrap(
        "We got your message.",
        f"""<p>Hey {payload.name},</p>
        <p>Thanks for reaching out about <strong style="color:#FAFAFA;">{payload.reason}</strong>. A human from our team will get back to you soon at this address.</p>
        <p style="color:#A1A1AA;font-style:italic;padding:16px;background:#1a1a20;border-radius:12px;border-left:3px solid #8B5CF6;">"{payload.message[:300]}"</p>
        <p>— CurlLoom</p>"""
    )
    _spawn(send_email(payload.email, "We received your message", html))
    return {"status": "ok", "id": doc["id"]}


@api_router.post("/quiz")
@limiter.limit("10/minute")
async def quiz(request: Request, payload: QuizIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.quiz_results.insert_one(dict(doc))

    if payload.email:
        html = _wrap(
            f"Your CurlLoom routine: {payload.routine_type}.",
            f"""<p>Based on your answers, we'd suggest the <strong style="color:#8B5CF6;">{payload.routine_type}</strong> as your starting point.</p>
            <p>Quick recap:</p>
            <ul style="color:#A1A1AA;line-height:1.8;">
              <li>Pattern: <span style="color:#FAFAFA;">{payload.hair_pattern}</span></li>
              <li>Porosity: <span style="color:#FAFAFA;">{payload.porosity}</span></li>
              <li>Biggest issue: <span style="color:#FAFAFA;">{payload.biggest_issue}</span></li>
              <li>Activity level: <span style="color:#FAFAFA;">{payload.activity_level}</span></li>
              <li>Product feel: <span style="color:#FAFAFA;">{payload.product_feel}</span></li>
            </ul>
            <p>Products aren't launched yet — but you'll hear from us first.</p>"""
        )
        _spawn(send_email(payload.email, "Your CurlLoom routine match", html))
    return {"status": "ok", "id": doc["id"], "routine": payload.routine_type}


@api_router.post("/waitlist")
@limiter.limit("10/minute")
async def waitlist(request: Request, payload: WaitlistIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.waitlist.insert_one(dict(doc))

    html = _wrap(
        f"You're on the {payload.product_name} list.",
        f"""<p>Thanks for telling us you're interested in the <strong style="color:#FAFAFA;">{payload.product_name}</strong>.</p>
        <p>This product is still in development. We'll email you the moment it's ready for testing or launch.</p>
        <p>— CurlLoom</p>"""
    )
    _spawn(send_email(payload.email, f"You're on the {payload.product_name} waitlist", html))
    return {"status": "ok", "id": doc["id"]}


@api_router.get("/admin/early-access")
async def list_early_access():
    return await db.early_access.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/contacts")
async def list_contacts():
    return await db.contacts.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/quiz")
async def list_quiz():
    return await db.quiz_results.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/waitlist")
async def list_waitlist():
    return await db.waitlist.find({}, {"_id": 0}).to_list(1000)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
