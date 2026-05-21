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

## Backlog / Next
**P1 (pre-launch hardening)**
- Auth on `/api/admin/*` endpoints (currently public)
- Mongo unique index on `ref_code`, atomic counter for `queue_position` (currently racy under concurrent load)
- `/api/referral/{code}` leaks signup name — consider returning only `referral_count`
- Verify `slowapi` is reading `X-Forwarded-For` so rate limits are per-user, not global
- Verify sender domain DKIM/SPF showing healthy in Resend dashboard

**P2 (growth)**
- Kickstarter landing block + launch pricing
- Analytics + cookie consent
- Stripe checkout when products ship
- Tester program portal
- Persistent email queue (redis/rq) for guaranteed delivery + retry

## Test Credentials
N/A — no auth.
