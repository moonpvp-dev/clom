# CurlLoom — PRD

## Original Problem Statement
Premium dark-mode marketing site for **CurlLoom**, an early-stage textured hair care brand for curls/waves/coils/perms/athletes. 14 pages, founder-led, science-backed, gender-neutral. Primary CTA: "Join Early Access". Secondary: "Take the Curl Quiz".

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn/UI + framer-motion
- **Backend**: FastAPI on /api with MongoDB (motor) + Resend email + slowapi rate-limiting
- **Visuals**: Custom CurlLoom logo (swirl) + CurlLoom bottle render (with per-product label overlay); SVG swirl motifs, glassmorphism, noise overlay
- **Theme**: dark (#0A0A0C), violet accents (#8B5CF6), Manrope (heading) + Inter (body)

## User Personas
- Curl/coil owners seeking lightweight, low-buildup products
- Permed-hair users needing gentle moisture/definition
- Athletes / active lifestyle users (sweat, helmets, refresh)
- Early-stage tester community + Kickstarter audience

## Core Requirements
- 14 pages: Home, Shop, Product Detail, Quiz, About, Ingredients, Testing & Safety, Athletes, Perm Care, FAQ, Contact, Shipping, Privacy, Terms
- Forms: Early Access (multi-field) + Founders Circle referral, Contact, Curl Quiz (6-step), Product Waitlist
- All form submissions persist to MongoDB + Resend confirmation emails from `news@curlloom.co`
- Cosmetic-only compliance language (no drug claims)
- Mobile-first, responsive
- Footer disclaimer + legal links

## What's Been Implemented

### Iteration 1 (2026-02)
- All 14 pages built and routed
- Sticky glass header, full nav, mobile menu, cart placeholder, Join Early Access CTA
- Footer with mission, socials (IG/TT/LI), legal links, disclaimer
- Home: hero, trust strip (6 badges), problem, solution, 6 product preview cards, philosophy bento, athletes block, perm block, testing preview, early access form
- Shop: filterable product grid
- Product Detail: sticky bottle, benefits, how-to, ingredient tags, safety note, waitlist
- Quiz: 6-step interactive with framer-motion, routine matcher, email capture
- Contact: full form with reason dropdown
- All compliance pages: Ingredients / Testing / Athletes / Perm / FAQ / Shipping / Privacy / Terms
- Backend: `/api/early-access`, `/api/contact`, `/api/quiz`, `/api/waitlist`, admin GETs
- Resend integration via async + asyncio.to_thread
- 100% E2E test pass

### Iteration 2 (2026-02, same session)
- ✅ Replaced text wordmark with uploaded CurlLoom swirl logo (header + footer)
- ✅ Replaced CSS bottle with premium product render image (`/brand/bottle.png`) — per-product label overlay
- ✅ Sender now `CurlLoom <news@curlloom.co>` (verified Resend domain)
- ✅ **Founders Circle referral system**: every signup gets a 6-char code, success card shows queue position + shareable link with `?ref=CODE` + one-tap copy. `referred_by` increments referrer's count. New `GET /api/referral/{code}` endpoint
- ✅ **slowapi rate limiting**: 5/min on early-access + contact, 10/min on quiz + waitlist, frontend shows 429-aware toast
- ✅ **Hard timeout on email send** (`asyncio.wait_for(..., timeout=10)`) + tracked background task registry (`_BG` set) so failures or rate-limits in Resend can never hang an API response
- ✅ 100% E2E test pass (19/19 backend tests + all 14 frontend routes)

### Iteration 3 (2026-02, same session)
- ✅ **Admin auth**: all `/api/admin/*` endpoints now require `Authorization: Bearer <ADMIN_TOKEN>`, validated with `secrets.compare_digest`. Token stored in `/app/backend/.env`
- ✅ **Atomic queue counter**: `db.counters.findOneAndUpdate({_id: 'early_access_position'}, {$inc: {value: 1}})` — race-safe under concurrent inserts
- ✅ **Unique ref_code index**: `db.early_access.create_index('ref_code', unique=True, sparse=True)` on startup, retry loop (5 attempts) on `DuplicateKeyError`
- ✅ **Narrowed referral endpoint**: `GET /api/referral/{code}` now returns only `{referral_count}` (no name/queue_position) + 30/min rate limit
- ✅ **Typography**: switched to SF Pro stack — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, ...` (real SF Pro on Apple, clean fallbacks elsewhere). Tighter heading letter-spacing, looser body line-height
- ✅ **Spacing overhaul**: `py-32 lg:py-44` on Section, larger header (`h-24`), footer (`py-28`, `gap-16`), card padding (`p-8 lg:p-10`), grid gaps (`gap-7 lg:gap-8`)
- ✅ **Testing agent**: 29/29 backend tests, all 14 frontend routes, EA + Contact forms verified

## Backlog / Next
**P1**
- Verify DKIM/SPF for curlloom.co showing green in Resend dashboard (external check on user side)
- Verify `slowapi` reads `X-Forwarded-For` so rate limits are per-user behind ingress proxy
- Decide if `ADMIN_TOKEN` should fail startup loudly when missing in production

**P2 (growth)**
- Kickstarter landing block + launch pricing
- Analytics + cookie consent
- Stripe checkout when products ship
- Tester program portal
- Persistent email queue (redis/rq) for guaranteed delivery + retry

## Test Credentials
N/A — no auth.
