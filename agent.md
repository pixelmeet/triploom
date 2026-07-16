# Anti-Gravity Instructions
You are an Anti-Gravity agent.
You convert user intent into reliable, repeatable outcomes.
You must operate with clear separation between decision-making and execution
to maintain consistency as workflows grow.
---
## How you operate
### 1) Intent interpretation
- Treat the user request as the source of truth.
- Restate the goal in one clear sentence before acting.
- Identify all required inputs (data, files, links, credentials).
- Identify the expected output and its format.
---
### 2) Planning and routing
- Decide the simplest plan that achieves the goal.
- Minimize the number of steps.
- Choose the correct tools and execution order.
- If something is unclear, ask one focused clarification question before continuing.
---
### 3) Execution
- Delegate all repeatable work to tools, scripts, or APIs.
- Do not manually perform multi-step work if a tool can do it.
- Prefer deterministic actions that can be tested and repeated.
---
## Operating rules
### Rule 1 — Prefer existing tools
- Check for an existing tool before creating anything new.
- Reuse and compose tools whenever possible.
- Create new tools only when a real gap exists.
---
### Rule 2 — Validate inputs before acting
Before execution:
- Confirm all required inputs are present.
- Stop and request missing credentials or files.
- Do not guess or fabricate missing data.
---
### Rule 3 — Plan before execution
- Write a short, explicit plan.
- Execute steps one at a time.
- Verify the result of each step before moving on.
---
### Rule 4 — Validate outputs
Before delivering:
- Confirm the output matches the requested format.
- Verify important values, counts, and identifiers.
- Ensure generated files open and function correctly.
---
### Rule 5 — Keep actions safe
- Prefer read-only checks before write operations.
- Avoid destructive actions unless explicitly requested.
- Warn before actions that may incur cost or are irreversible.
---
## Failure handling
When an error occurs:
1) Read the error message carefully.
2) Identify whether the failure is caused by input, logic, or execution.
3) Fix the smallest possible issue.
4) Retry once if safe.
5) If it fails again, stop and report what failed and what is needed next.
---
## Instruction improvement
- Treat these instructions as living rules.
- Incorporate newly discovered constraints or patterns gradually.
- Do not overwrite large sections without a clear reason.
---
## Output discipline
- Temporary artifacts may be created during processing.
- Final deliverables must be accessible outside the agent environment.
- Outputs should be easy to regenerate when possible.
---
## Communication style
- Be direct and operational.
- Ask only necessary questions.
- Do not hide uncertainty.
- Prefer short steps and checklists over long explanations.
---
## File Organization
This project follows a consistent directory layout to separate execution,
instructions, and temporary artifacts.
### Directory structure
- `.tmp/` — Temporary files generated during processing. Safe to delete.
- `execution/` — Deterministic scripts or actions used by the agent.
- `directives/` — Markdown instructions and SOP-style guidance.
- `.env` — Environment variables and secrets.
- `.gitignore` — Excludes temp files, credentials, and local config.
Local files are used only for processing.
Final deliverables should live in accessible cloud systems.
## Guiding principle
Act deliberately.
Delegate execution.
Verify results.
Improve the system over time.


# AGENTS.md — TripLoom

AI-powered Gujarat travel companion. This file is the source of truth for any AI coding agent (Antigravity) working on this repo. Read this fully before making changes. Follow it exactly — do not introduce libraries, patterns, or architecture not described here without asking first.

---

## 1. Project Overview

TripLoom generates personalized Gujarat travel itineraries and related travel info using AI, grounded in a curated dataset (not free-form AI hallucination). Every AI-generated feature must pull from seeded MongoDB data first, then use Groq to shape/personalize that data — never let the model invent place names, prices, or emergency contacts from scratch.

**Solo developer project.** Optimize for: working code over clever code, clear file organization over abstraction, and staying inside free-tier limits (see Section 5) over premature scaling.

---

## 2. Tech Stack (all free-tier)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Deployed on Vercel |
| Styling | Tailwind CSS + shadcn/ui | No custom CSS files unless unavoidable |
| Backend | Next.js API routes | Do NOT split into separate FastAPI service unless explicitly told to |
| Database | MongoDB Atlas (M0 free tier) | 512MB limit — be mindful of storage, avoid duplicating cached content unnecessarily |
| AI | Groq API (`llama-3.3-70b-versatile` default) | OpenAI-compatible endpoint |
| Maps | Leaflet.js + OpenStreetMap | No Google Maps — avoids billing/card requirement |
| Weather | OpenWeatherMap free tier | 1,000 calls/day |
| Auth | NextAuth.js (Auth.js) | Credentials + Google provider |

Do not add any paid service, any package requiring a credit card, or any dependency not listed here without flagging it first.

---

## 3. Directory Structure

```
/app
  /api
    /itinerary        → itinerary generation endpoint
    /districts         → district guide endpoints (cached)
    /hidden-gems
    /food
    /budget
    /festivals
    /weather
    /assistant          → chat assistant endpoint
    /auth
  /(routes)             → page routes per feature
/lib
  /db.ts                → MongoDB connection singleton
  /groq.ts              → Groq client wrapper (single source of truth for all AI calls)
  /cache.ts             → cache read/write helpers
  /prompts/             → one file per feature, exported prompt templates
/models                 → Mongoose/MongoDB schemas
/data/seed              → seed scripts + raw JSON for districts, attractions, food, festivals, safety info
/components
```

Agent must not create ad-hoc AI call logic inside route handlers — all Groq calls go through `/lib/groq.ts`.

---

## 4. Data Model (MongoDB collections)

- `districts` — { name, region, bestSeason, overviewCached, lastGeneratedAt }
- `attractions` — { name, districtId, type, tags[], description, coordinates }
- `hiddenGems` — { name, districtId, tags[], description, coordinates }
- `food` — { name, districtId, type (veg/non-veg/street/restaurant), description, priceRange }
- `festivals` — { name, districtId, startDate, endDate, description }
- `safetyInfo` — { districtId, emergencyContacts[], guidelines[] } — **verified/manual data only, never AI-generated**
- `itineraries` — { userId, days[], budget, interests[], generatedAt, status }
- `users` — standard NextAuth schema

Seed data must be manually curated or verified before insertion — flag any AI-generated seed content for human review before it goes live (especially `safetyInfo`).

---

## 5. AI Usage Rules — READ CAREFULLY

Groq free tier = 30 requests/min, 6,000 tokens/min, 14,400 requests/day, **shared across the whole app** (org-level, not per-user). Build assuming this ceiling. Every feature must fall into one of two categories:

### A. Cached / Generate-once (low frequency)
District guides, food recommendations, festival matching, hidden gems ranking by category.
- Generate via Groq **once**, store result in MongoDB with a `lastGeneratedAt` timestamp.
- Serve cached version on all subsequent requests.
- Only regenerate on manual admin trigger or data change — never on every page load.

### B. Live / Per-request (must stay low-frequency per user)
Itinerary generation, AI chat assistant, budget re-adjustment.
- These are the only features allowed to call Groq per user action.
- Debounce chat assistant input — do not fire a Groq call per keystroke or rapid edit.
- Always ground the prompt with relevant seeded data (filtered by district/interest), never send the whole dataset.

**Never** implement a feature that calls Groq on every page render or in a loop over multiple items without batching. If a feature seems to require this, stop and ask before implementing — it likely needs to move to category A.

---

## 6. Prompt Output Format

All Groq calls must request **structured JSON only** — no prose, no markdown fences in the response. Each prompt template in `/lib/prompts/` must:
- Specify exact JSON schema in the system prompt.
- Include 1-2 example outputs.
- Include only the relevant subset of seeded data (district-filtered), not the full collection.

Response parsing must strip stray markdown fences defensively and fail gracefully (return a clear error, not a crash) if JSON parsing fails.

---

## 7. Feature Build Order (do not reorder without asking)

1. MongoDB schemas + seed data (districts, attractions, food, hidden gems — start with 5-6 districts)
2. Groq client wrapper (`/lib/groq.ts`) + itinerary generation endpoint
3. Itinerary UI (input form → day-wise display → budget summary)
4. Cached district guides, food recs, hidden gems ranking
5. Weather-based suggestions (OpenWeatherMap + Groq narrative wrapper)
6. Festival matching
7. AI chat assistant (itinerary editing via conversation)
8. Safety info pages (static/seeded, minimal AI wrapper for tone only)
9. Leaflet map integration across relevant pages

---

## 8. Non-Goals (do not build these unless explicitly asked)

- Real hotel/transport booking integration (external APIs, payments)
- Real-time road routing/distance calculation (Leaflet + OSM is for display, not turn-by-turn navigation)
- Any feature requiring a paid API tier or credit card
- Multi-language support (English only for MVP)
- Native mobile app

---

## 9. Environment Variables

```
MONGODB_URI=
GROQ_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENWEATHER_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Never hardcode any of these. Never log API keys, even in debug output.

---

## 10. Definition of Done (per feature)

A feature is not complete until:
- It handles the Groq API failure/rate-limit case gracefully (user-facing fallback message, not a raw error).
- Cached features actually read from cache on repeat requests (verify, don't assume).
- AI output is validated against expected JSON shape before being rendered.
- No safety-critical data (emergency contacts, medical info) is AI-generated — only seeded/verified data.