from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
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

app = FastAPI(title="CurlLoom API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# -------- Models --------
class EarlyAccessIn(BaseModel):
    name: str
    email: EmailStr
    hair_type: str
    main_concern: str
    is_athlete: bool = False
    interested_in_testing: bool = False

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


# -------- Email helper --------
def _wrap_email(title: str, body_html: str) -> str:
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
          <tr><td style="font-size:15px;line-height:1.6;color:#A1A1AA;">{body_html}</td></tr>
          <tr><td style="padding-top:32px;font-size:12px;color:#52525B;border-top:1px solid #27272A;padding-top:24px;margin-top:24px;">
            CurlLoom &middot; help@curlloom.co<br/>
            Cosmetic products only — not intended to diagnose, treat, cure, or prevent any disease.
          </td></tr>
        </table>
      </td></tr>
    </table>
    """

async def send_email_safe(to: str, subject: str, html: str):
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set; skipping email")
        return None
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        return result
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return None


# -------- Routes --------
@api_router.get("/")
async def root():
    return {"message": "CurlLoom API live"}


@api_router.post("/early-access")
async def early_access(payload: EarlyAccessIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.early_access.insert_one(dict(doc))

    html = _wrap_email(
        "You're on the early access list.",
        f"""<p>Hey {payload.name},</p>
        <p>Thanks for joining CurlLoom early access. We're building lightweight, low-buildup curl care for real routines — and you'll be one of the first to hear when products are ready for testing.</p>
        <p>We logged your preferences:</p>
        <ul style="color:#A1A1AA;line-height:1.8;">
          <li>Hair type: <span style="color:#FAFAFA;">{payload.hair_type}</span></li>
          <li>Main concern: <span style="color:#FAFAFA;">{payload.main_concern}</span></li>
          <li>Active lifestyle: <span style="color:#FAFAFA;">{'Yes' if payload.is_athlete else 'No'}</span></li>
          <li>Interested in testing: <span style="color:#FAFAFA;">{'Yes' if payload.interested_in_testing else 'No'}</span></li>
        </ul>
        <p>Talk soon,<br/>The CurlLoom team</p>"""
    )
    asyncio.create_task(send_email_safe(payload.email, "Welcome to CurlLoom early access", html))
    return {"status": "ok", "id": doc["id"]}


@api_router.post("/contact")
async def contact(payload: ContactIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(dict(doc))

    html = _wrap_email(
        "We got your message.",
        f"""<p>Hey {payload.name},</p>
        <p>Thanks for reaching out about <strong style="color:#FAFAFA;">{payload.reason}</strong>. A human from our team will get back to you soon at this address.</p>
        <p style="color:#A1A1AA;font-style:italic;">"{payload.message[:300]}"</p>
        <p>— CurlLoom</p>"""
    )
    asyncio.create_task(send_email_safe(payload.email, "We received your message", html))
    return {"status": "ok", "id": doc["id"]}


@api_router.post("/quiz")
async def quiz(payload: QuizIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.quiz_results.insert_one(dict(doc))

    if payload.email:
        html = _wrap_email(
            f"Your CurlLoom routine: {payload.routine_type}.",
            f"""<p>Based on your answers, we'd suggest the <strong style="color:#8B5CF6;">{payload.routine_type}</strong> as your starting point.</p>
            <p>Quick recap of your answers:</p>
            <ul style="color:#A1A1AA;line-height:1.8;">
              <li>Pattern: <span style="color:#FAFAFA;">{payload.hair_pattern}</span></li>
              <li>Porosity: <span style="color:#FAFAFA;">{payload.porosity}</span></li>
              <li>Biggest issue: <span style="color:#FAFAFA;">{payload.biggest_issue}</span></li>
              <li>Activity level: <span style="color:#FAFAFA;">{payload.activity_level}</span></li>
              <li>Product feel: <span style="color:#FAFAFA;">{payload.product_feel}</span></li>
            </ul>
            <p>Products aren't launched yet — but you'll hear from us first.</p>"""
        )
        asyncio.create_task(send_email_safe(payload.email, "Your CurlLoom routine match", html))
    return {"status": "ok", "id": doc["id"], "routine": payload.routine_type}


@api_router.post("/waitlist")
async def waitlist(payload: WaitlistIn):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.waitlist.insert_one(dict(doc))

    html = _wrap_email(
        f"You're on the {payload.product_name} list.",
        f"""<p>Thanks for telling us you're interested in the <strong style="color:#FAFAFA;">{payload.product_name}</strong>.</p>
        <p>This product is still in development. We'll email you the moment it's ready for testing or launch.</p>
        <p>— CurlLoom</p>"""
    )
    asyncio.create_task(send_email_safe(payload.email, f"You're on the {payload.product_name} waitlist", html))
    return {"status": "ok", "id": doc["id"]}


@api_router.get("/admin/early-access")
async def list_early_access():
    items = await db.early_access.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/admin/contacts")
async def list_contacts():
    items = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/admin/quiz")
async def list_quiz():
    items = await db.quiz_results.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/admin/waitlist")
async def list_waitlist():
    items = await db.waitlist.find({}, {"_id": 0}).to_list(1000)
    return items


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
