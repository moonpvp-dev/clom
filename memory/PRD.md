# CurlLoom — PRD

## Original Problem Statement
Build a complete, premium, conversion-focused dark-mode website for **CurlLoom**, an early-stage textured hair care brand targeting wavy/curly/coily/permed hair plus athletes. 14 pages with founder-led, science-backed, gender-neutral tone. Primary CTA: "Join Early Access". Secondary: "Take the Curl Quiz".

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn/UI + framer-motion
- **Backend**: FastAPI on /api with MongoDB (motor) + Resend email
- **Visuals**: 100% CSS/SVG — no photos (user requirement). Abstract bottle renderings, swirl SVGs, glassmorphism, noise overlay.
- **Theme**: dark (#0A0A0C), violet accents (#8B5CF6), Manrope (heading) + Inter (body)

## User Personas
- Curl/coil owners seeking lightweight, low-buildup products
- Permed-hair users needing gentle moisture/definition
- Athletes / active lifestyle users (sweat, helmets, refresh)
- Early-stage tester community + Kickstarter audience

## Core Requirements (Static)
- 14 pages: Home, Shop, Product Detail, Quiz, About, Ingredients, Testing & Safety, Athletes, Perm Care, FAQ, Contact, Shipping, Privacy, Terms
- Forms: Early Access (multi-field), Contact, Curl Quiz (6-step), Product Waitlist
- All form submissions persisted to MongoDB + confirmation emails via Resend
- Cosmetic-only compliance language (no drug claims)
- Mobile-first, fully responsive
- Footer disclaimer + legal links

## What's Been Implemented (2026-02)
- ✅ All 14 pages built and routed
- ✅ Header (sticky glass) with full nav + mobile menu + cart icon placeholder + Join Early Access CTA
- ✅ Footer with mission, socials (IG/TT/LI), legal links, disclaimer
- ✅ Home: hero, trust strip (6 badges), problem, solution, 6 product preview cards, philosophy bento, athletes block, perm block, testing preview, early access form
- ✅ Shop: filterable product grid (status filters)
- ✅ Product Detail: sticky CSS bottle, benefits, how-to, ingredient tags, safety note, waitlist
- ✅ Quiz: 6-step interactive (framer-motion), routine matcher, email capture
- ✅ Contact: full form with reason dropdown
- ✅ Ingredients / Testing / Athletes / Perm / FAQ / Shipping / Privacy / Terms pages
- ✅ Backend endpoints: /api/early-access, /api/contact, /api/quiz, /api/waitlist + admin GETs
- ✅ Resend integration with non-blocking asyncio.to_thread email sending
- ✅ data-testid on all interactive elements
- ✅ Full E2E test pass (100% backend, 100% frontend)

## Backlog / Next
**P1**
- Real CurlLoom logo upload (currently text wordmark with swirl SVG)
- Admin endpoints behind auth (currently unauthenticated — noted by test agent)
- Rate-limiting on public POSTs to prevent spam
- 404 fallback for unknown product slugs

**P2**
- Verify sender domain in Resend (currently using onboarding@resend.dev — test mode)
- Kickstarter integration / launch pricing page
- Analytics + cookie consent banner
- E-commerce: Stripe checkout when products are ready
- Tester program portal / dashboard

## Test Credentials
N/A — no auth in the app currently.
