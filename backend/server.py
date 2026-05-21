from fastapi import FastAPI, APIRouter, HTTPException, Request, Header, Depends
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
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')

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


def require_admin(authorization: Optional[str] = Header(None)):
    if not ADMIN_TOKEN:
        raise HTTPException(503, "Admin token not configured")
    expected = f"Bearer {ADMIN_TOKEN}"
    if not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(401, "Unauthorized")
    return True


async def next_queue_position() -> int:
    """Atomic counter — safe under concurrent inserts."""
    res = await db.counters.find_one_and_update(
        {"_id": "early_access_position"},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=True,
    )
    return res["value"]


@app.on_event("startup")
async def on_startup():
    # Unique index on ref_code prevents duplicate codes under concurrency
    await db.early_access.create_index("ref_code", unique=True, sparse=True)
    await db.early_access.create_index("email")
    await db.products.create_index("slug", unique=True)
    # Backfill counter to current count so newly issued positions don't collide
    existing = await db.counters.find_one({"_id": "early_access_position"})
    if existing is None:
        current = await db.early_access.count_documents({})
        await db.counters.insert_one({"_id": "early_access_position", "value": current})
    # Seed default products if collection empty
    if await db.products.count_documents({}) == 0:
        defaults = [
            {"slug": "leave-in-conditioner", "name": "Leave-In Conditioner", "short": "Lightweight daily moisture for curls, waves, coils, and perms.", "bestFor": "Daily hydration without buildup", "status": "In Development", "accent": "#8B5CF6", "image": "/brand/leave-in.png", "benefits": ["Helps soften hair", "Supports manageability", "Designed for low buildup", "Helps improve slip and spreadability", "Lightweight enough for active routines"], "who": "Curls, waves, coils, and permed hair that need daily moisture without weight.", "feel": "Watery-cream texture. Absorbs without stickiness.", "howTo": "Apply to damp hair, mid-lengths to ends. Scrunch or rake through. Style as usual.", "ingredients": ["Humectants (moisture)", "Lightweight emollients (slip)", "Conditioning polymers", "Preservatives (safety)", "Chelators (stability)"], "sort_order": 1},
            {"slug": "curl-cream", "name": "Curl Cream", "short": "Definition and softness with flexible styling support.", "bestFor": "Soft definition with movement", "status": "Planned", "accent": "#A78BFA", "image": None, "benefits": ["Supports curl definition", "Helps soften strands", "Designed for flexible, touchable finish", "Low-buildup formulation approach"], "who": "Anyone seeking definition without crunch or heaviness.", "feel": "Smooth cream that melts in.", "howTo": "Apply to wet or damp hair. Rake, scrunch, or finger-coil.", "ingredients": ["Humectants", "Conditioning emollients", "Film-forming polymers", "Preservatives", "Chelators"], "sort_order": 2},
            {"slug": "gel", "name": "Gel", "short": "Hold and performance — designed to form a cast that breaks cleanly.", "bestFor": "Long-lasting definition and hold", "status": "In Testing", "accent": "#7C3AED", "image": None, "benefits": ["Designed for clean cast that breaks softly", "Supports definition through the day", "Low-buildup design", "Lightweight feel"], "who": "Anyone who wants serious hold without flake or stickiness.", "feel": "Clear, slick gel. No tackiness once set.", "howTo": "Apply over leave-in or cream. Smooth in sections. Scrunch out crunch when dry.", "ingredients": ["Hold polymers", "Humectants", "Plasticizers (clean break)", "Preservatives", "Chelators"], "sort_order": 3},
            {"slug": "mousse", "name": "Mousse", "short": "Volume and lightweight styling — air-feel finish.", "bestFor": "Volume and bounce", "status": "Planned", "accent": "#C4B5FD", "image": None, "benefits": ["Supports volume at root and lengths", "Lightweight, airy feel", "Low-residue design"], "who": "Fine to medium textures wanting body without heaviness.", "feel": "Whipped foam that disappears.", "howTo": "Dispense a palmful onto damp hair. Scrunch upward from ends.", "ingredients": ["Volumizing polymers", "Humectants", "Preservatives"], "sort_order": 4},
            {"slug": "shampoo", "name": "Shampoo", "short": "Gentle cleansing — designed to be low-stripping.", "bestFor": "Routine cleansing without dryness", "status": "Planned", "accent": "#8B5CF6", "image": None, "benefits": ["Designed for gentle, low-strip cleansing", "Helps support scalp comfort", "Pairs with the rest of the routine"], "who": "Textured, curly, permed, and active hair types.", "feel": "Soft lather, clean rinse.", "howTo": "Apply to wet scalp. Massage gently. Rinse thoroughly.", "ingredients": ["Mild surfactants", "Conditioning agents", "Chelators", "Preservatives"], "sort_order": 5},
            {"slug": "conditioner", "name": "Conditioner", "short": "Softness and detangling for everyday use.", "bestFor": "Slip and softness in-shower", "status": "Planned", "accent": "#A78BFA", "image": None, "benefits": ["Helps detangle", "Supports softness", "Low-buildup approach"], "who": "All textured hair, including permed strands.", "feel": "Silky, rinses clean.", "howTo": "Apply to wet hair after shampoo. Distribute. Rinse.", "ingredients": ["Conditioning emollients", "Cationic polymers", "Humectants", "Preservatives"], "sort_order": 6},
        ]
        for d in defaults:
            d["id"] = str(uuid.uuid4())
            d["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.insert_many(defaults)


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


class ProductIn(BaseModel):
    slug: str
    name: str
    short: str
    bestFor: str = ""
    status: str = "Planned"
    accent: str = "#8B5CF6"
    image: Optional[str] = None
    benefits: List[str] = []
    who: str = ""
    feel: str = ""
    howTo: str = ""
    ingredients: List[str] = []
    sort_order: int = 0


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
    # Atomic queue position
    total = await next_queue_position()

    # Insert with unique-index retry on collision
    from pymongo.errors import DuplicateKeyError
    for _ in range(5):
        ref_code = _make_ref_code()
        doc = {
            "id": str(uuid.uuid4()),
            **payload.model_dump(),
            "ref_code": ref_code,
            "referral_count": 0,
            "queue_position": total,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            await db.early_access.insert_one(dict(doc))
            break
        except DuplicateKeyError:
            continue
    else:
        raise HTTPException(500, "Could not generate unique ref code")

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
@limiter.limit("30/minute")
async def referral_info(request: Request, code: str):
    doc = await db.early_access.find_one({"ref_code": code.upper()}, {"_id": 0, "referral_count": 1})
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
async def list_early_access(_: bool = Depends(require_admin)):
    return await db.early_access.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/contacts")
async def list_contacts(_: bool = Depends(require_admin)):
    return await db.contacts.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/quiz")
async def list_quiz(_: bool = Depends(require_admin)):
    return await db.quiz_results.find({}, {"_id": 0}).to_list(1000)

@api_router.get("/admin/waitlist")
async def list_waitlist(_: bool = Depends(require_admin)):
    return await db.waitlist.find({}, {"_id": 0}).to_list(1000)


# ---- Products (public + admin) ----
# NOTE: Products routes MUST be declared BEFORE the generic /admin/{kind}/{item_id}
# DELETE handler, otherwise FastAPI matches the catch-all first and returns
# "Unknown collection" for product deletes.
@api_router.get("/products")
async def list_products():
    return await db.products.find({}, {"_id": 0}).sort("sort_order", 1).to_list(200)

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    return p

@api_router.post("/admin/products")
async def create_product(payload: ProductIn, _: bool = Depends(require_admin)):
    from pymongo.errors import DuplicateKeyError
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.products.insert_one(dict(doc))
    except DuplicateKeyError:
        raise HTTPException(409, "Slug already exists")
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/products/{slug}")
async def update_product(slug: str, payload: ProductIn, _: bool = Depends(require_admin)):
    update = payload.model_dump()
    # If slug is being changed, ensure uniqueness
    if update["slug"] != slug:
        existing = await db.products.find_one({"slug": update["slug"]}, {"_id": 1})
        if existing:
            raise HTTPException(409, "New slug already in use")
    res = await db.products.find_one_and_update(
        {"slug": slug},
        {"$set": update},
        return_document=True,
        projection={"_id": 0},
    )
    if not res:
        raise HTTPException(404, "Not found")
    return res

@api_router.delete("/admin/products/{slug}")
async def delete_product(slug: str, _: bool = Depends(require_admin)):
    res = await db.products.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"status": "ok"}


# ---- Delete submission entries (generic catch-all — declared LAST) ----
_DELETE_COLLECTIONS = {
    "early-access": "early_access",
    "contacts": "contacts",
    "quiz": "quiz_results",
    "waitlist": "waitlist",
}

@api_router.delete("/admin/{kind}/{item_id}")
async def delete_submission(kind: str, item_id: str, _: bool = Depends(require_admin)):
    coll = _DELETE_COLLECTIONS.get(kind)
    if not coll:
        raise HTTPException(404, "Unknown collection")
    res = await db[coll].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Item not found")
    return {"status": "ok"}


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
