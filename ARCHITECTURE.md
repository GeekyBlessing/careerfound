# CareerFound — Tech Career Launchpad
### Product & Technical Architecture

> "You don't need to figure out your entire future today. You just need to know your next step."

This document is the source of truth for product architecture, data model, API design, folder
structure, UX flows, and build scope. It is written before implementation and updated as the
system evolves.

---

## 1. Product Architecture

### 1.1 System overview

CareerFound is a three-tier application:

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (Next.js 14, App Router, TypeScript, Tailwind, shadcn)   │
│  - Server components for content-heavy, low-interactivity pages  │
│  - Client components for interactive flows (assessment, chat)    │
│  - Mobile-first, offline-aware (service worker cache for lessons)│
└───────────────────────────┬───────────────────────────────────────┘
                             │ REST/JSON over HTTPS (JWT bearer)
┌───────────────────────────▼───────────────────────────────────────┐
│  API (FastAPI, Python 3.11, Pydantic v2, SQLAlchemy 2.0 async)   │
│  - Routers per domain (auth, assessment, roadmap, mentor, ...)   │
│  - Service layer holds business logic, routers stay thin         │
│  - AI Abstraction Layer (LLMClient) isolates all model calls     │
│  - Rate limiting, structured logging, audit log middleware       │
└───────────────────────────┬───────────────────────────────────────┘
                             │ asyncpg
┌───────────────────────────▼───────────────────────────────────────┐
│  PostgreSQL 16                                                    │
│  - Source of truth for users, content, progress, AI history       │
└─────────────────────────────────────────────────────────────────┘
```

Supporting infrastructure: Docker Compose for local/dev parity, Alembic for migrations, a
Terraform-ready layout (`infra/`) for cloud deployment (ECS/Fly/Render + managed Postgres),
GitHub Actions-ready CI config.

### 1.2 Core design principle: the AI Abstraction Layer

Every AI-powered feature (career assessment analysis, AI mentor, project reviewer, portfolio
copywriter) goes through a single `LLMClient` interface in `backend/app/ai/`. Nothing in the
routers or frontend calls a model provider directly. This means:

- The entire product is fully clickable today using `MockLLMProvider`, which returns realistic,
  structured, deterministic-enough JSON for every AI feature.
- Going live is a one-line config change (`LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` in
  `.env`) to swap in `AnthropicProvider` — no route or frontend code changes.
- All prompts are versioned templates with structured (Pydantic-validated) output schemas, so a
  provider swap can't silently break the contract the frontend depends on.
- User-supplied text going into any prompt is wrapped with an instruction-isolation template and
  passed through a lightweight prompt-injection heuristic filter before being sent to a real
  provider (see §20 Security).

### 1.3 Personalization model

Personalization is not "pick a career, get a static PDF." Three data structures drive it:

1. **Profile vector** — structured answers from onboarding + assessment (age range, education,
   time available, budget, interests, work-style preferences, etc.), stored on `assessments`.
2. **Skill graph** — a directed graph of skills per career path (`skill_nodes` +
   `skill_edges`), with the user's mastery level (`user_skill_progress`) computed from completed
   lessons/projects/quizzes.
3. **Readiness score** — a weighted rollup (knowledge, projects, portfolio, interview readiness,
   practical skills) recomputed whenever progress changes, with a "what moves you from X → Y"
   diff generator.

The roadmap, "Today's Mission" engine, and skill graph all read from the same progress model, so
they never disagree with each other.

---

## 2. User Journey

```
Landing → "Find My Tech Path" assessment → AI-generated recommendations
   (Best Match / Strong Alternative / Wild Card)
 → user picks a path → account created (or account created first, path chosen after — both
   entry points supported) → personalized roadmap generated
 → Dashboard becomes home base → "What should I do today?" → Lesson → Exercise → Mini-project
 → Checkpoint quiz → Skill graph updates → Readiness score updates
 → Portfolio project generated from completed project → added to Portfolio Builder
 → Recurring loop: Dashboard → Today's Mission → AI Mentor for help when stuck
 → Milestone: readiness score crosses threshold → "Job-Readiness Mode" simulations unlock
 → Optional: browse Mentorship Marketplace, join Community for the chosen path
```

Two hard rules enforced throughout the UI:
- **One next action, always.** The dashboard never shows a catalog; it shows *today's mission*.
- **Beginner Mode ("I Know Nothing")** is a persistent toggle, not a one-time onboarding choice —
  every glossary term becomes an inline explainer when it's on.

---

## 3. Feature Hierarchy (MVP vs. architected-only)

**Fully built end-to-end in this pass** (real DB, real API, real UI):
- Landing page
- Auth (email/password, JWT; Google OAuth wired with a clearly marked integration point)
- Onboarding flow
- Career Discovery Engine ("Find Your Tech Path")
- Personalized roadmap generator (2 fully-seeded paths: Cybersecurity, Software Engineering;
  lighter seed for the rest)
- Dashboard + "What should I do today?" engine
- Skill graph (visual, dependency-aware)
- Tech Readiness Score
- AI Mentor chat (mocked LLM, full memory model)
- Project system (step-by-step guidance, hints, AI project reviewer)
- Portfolio builder (auto-generated descriptions/README/CV bullets/LinkedIn copy, editable)

**Architected + real schema + working API stubs, UI deferred or minimal** (clearly marked
integration points, not fake buttons — each returns real data from the DB, just without a fully
designed frontend yet):
- Mentorship marketplace (mentor listing/filter/booking API + DB, payments integration point)
- Community (posts, leaderboards, study groups — schema + list/create API)
- Admin dashboard (metrics API + data model; minimal UI)
- Real-world simulation engine (schema + 3 seeded scenarios wired into readiness score)

---

## 4. Database Schema

PostgreSQL, `snake_case`, UUID primary keys, `created_at`/`updated_at` on every table.
Full DDL lives in `backend/alembic/versions/0001_initial.py`; summary below.

```
users
  id, email (unique), password_hash, full_name, country, timezone,
  persona (student|graduate|working|switcher|entrepreneur|other),
  goal (job|freelance|startup|remote|explore),
  device_access (laptop|smartphone|both), time_budget_minutes_per_day,
  beginner_mode (bool), plan (free|pro), role (user|mentor|admin),
  google_id (nullable), created_at, updated_at, last_active_at

assessments
  id, user_id → users, answers (jsonb: full questionnaire),
  best_match_path_id, strong_alt_path_id, wild_card_path_id,
  career_dna (jsonb: strengths profile for radar chart), created_at

career_paths
  id, slug (unique), name, summary, difficulty (1-5), avg_timeline_weeks,
  entry_roles (jsonb[]), tools (jsonb[]), remote_potential (0-100),
  earning_notes, icon, is_active

path_fit_rules
  id, path_id → career_paths, trait_key, weight, direction
  -- declarative scoring rules the assessment engine evaluates against profile vector

roadmaps
  id, user_id → users, path_id → career_paths, status (active|completed|archived),
  generated_at, adapted_at (last time roadmap adjusted from progress)

roadmap_phases
  id, roadmap_id → roadmaps, path_id → career_paths (for reusable phase templates),
  order_index, title, summary, unlocks_at_skill_pct

lessons
  id, phase_id → roadmap_phases, order_index, title, concept_summary,
  beginner_explainer, content_md, est_minutes, skill_node_id → skill_nodes

exercises
  id, lesson_id → lessons, prompt, type (mcq|short_answer|scenario), answer_key (jsonb)

mini_projects / projects
  id, phase_id → roadmap_phases, order_index, title, teaches, prerequisites (jsonb),
  expected_output, steps (jsonb[]), hints (jsonb[]), common_mistakes (jsonb[]),
  difficulty, skill_node_id → skill_nodes

quizzes / checkpoints
  id, phase_id → roadmap_phases, title, passing_score, questions (jsonb)

skill_nodes
  id, path_id → career_paths, key, label, category

skill_edges
  id, path_id → career_paths, from_skill_id → skill_nodes, to_skill_id → skill_nodes
  -- defines the dependency graph (Networking → Linux → Security Fundamentals → SOC ...)

user_progress
  id, user_id → users, lesson_id/project_id/quiz_id (nullable FKs), status
  (not_started|in_progress|completed), score (nullable), completed_at

user_skill_progress
  id, user_id → users, skill_node_id → skill_nodes, mastery_pct (0-100), updated_at

daily_missions
  id, user_id → users, date, tasks (jsonb[]: {type, title, est_minutes, done}),
  rationale_text, generated_at

readiness_scores
  id, user_id → users, overall, knowledge_pct, projects_pct, portfolio_pct,
  interview_pct, practical_pct, computed_at, next_actions (jsonb[])

simulations
  id, path_id → career_paths, title, scenario_md, options (jsonb), correct_option,
  explanation_md, difficulty

user_simulation_attempts
  id, user_id → users, simulation_id → simulations, chosen_option, correct (bool), attempted_at

ai_conversations
  id, user_id → users, kind (mentor|interview|review), created_at

ai_messages
  id, conversation_id → ai_conversations, role (user|assistant|system), content,
  meta (jsonb: e.g. detected_struggle, suggested_adjustment), created_at

portfolio_items
  id, user_id → users, project_id → projects, title,
  project_description, readme_draft, cv_bullet, linkedin_blurb, case_study_md,
  skills_demonstrated (jsonb[]), is_published, updated_at

mentors
  id, user_id → users (nullable if not also a platform user), headline, bio,
  paths (jsonb[]: career_path slugs), years_experience, hourly_rate_cents, currency,
  rating_avg, rating_count, is_verified, is_active

mentor_sessions
  id, mentor_id → mentors, mentee_id → users, scheduled_at, duration_minutes,
  status (requested|confirmed|completed|cancelled), price_cents, currency,
  payment_provider_ref (nullable), created_at

mentor_reviews
  id, session_id → mentor_sessions, rating (1-5), comment, created_at

communities
  id, path_id → career_paths, name, description

community_posts
  id, community_id → communities, user_id → users, kind (discussion|question|showcase|challenge),
  title, body, upvotes, created_at

community_comments
  id, post_id → community_posts, user_id → users, body, created_at

leaderboard_entries (materialized/derived, refreshed job)
  id, community_id → communities, user_id → users, period (weekly|all_time), xp, rank

xp_events
  id, user_id → users, amount, reason, created_at

streaks
  id, user_id → users, current_streak_days, longest_streak_days, last_active_date

audit_logs
  id, user_id (nullable), action, resource_type, resource_id, ip_hash, created_at

ai_rate_limits (or Redis in production; Postgres fallback documented)
  id, user_id → users, endpoint, window_start, request_count
```

---

## 5. API Design (REST, `/api/v1`)

All endpoints return `{ data, error }` envelopes; errors use RFC7807-style problem details.
Auth via `Authorization: Bearer <JWT>`. See `backend/app/api/` for full implementation;
representative surface:

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/google            (integration point — see AUTH_GOOGLE_CLIENT_ID)
GET    /api/v1/users/me
PATCH  /api/v1/users/me
PATCH  /api/v1/users/me/beginner-mode

GET    /api/v1/careers                          list all career paths (public)
GET    /api/v1/careers/{slug}                   career path detail

POST   /api/v1/assessment                       submit questionnaire → AI analysis
GET    /api/v1/assessment/latest
GET    /api/v1/assessment/{id}

POST   /api/v1/roadmaps                         {path_slug} → generate personalized roadmap
GET    /api/v1/roadmaps/active
GET    /api/v1/roadmaps/{id}/phases
GET    /api/v1/phases/{id}
POST   /api/v1/lessons/{id}/complete
POST   /api/v1/exercises/{id}/submit
POST   /api/v1/projects/{id}/submit
POST   /api/v1/quizzes/{id}/submit

GET    /api/v1/dashboard                        today's mission + summary payload
GET    /api/v1/dashboard/mission/today

GET    /api/v1/skill-graph                      nodes+edges+mastery for active roadmap
GET    /api/v1/readiness-score
GET    /api/v1/readiness-score/history

POST   /api/v1/simulations/{id}/attempt
GET    /api/v1/simulations?path=cybersecurity

POST   /api/v1/mentor/chat                      AI mentor turn (stores + returns memory-aware reply)
GET    /api/v1/mentor/conversations/{id}
POST   /api/v1/mentor/mock-interview/start
POST   /api/v1/mentor/mock-interview/{id}/turn
POST   /api/v1/projects/{id}/review              AI project reviewer (paste code/link)

GET    /api/v1/portfolio
POST   /api/v1/portfolio/generate               {project_id} → drafts (description/README/CV/LinkedIn)
PATCH  /api/v1/portfolio/{id}

GET    /api/v1/mentors?path=&min_rating=
GET    /api/v1/mentors/{id}
POST   /api/v1/mentors/{id}/sessions            book (payment integration point — Stripe)
GET    /api/v1/sessions/mine

GET    /api/v1/communities/{path}
GET    /api/v1/communities/{path}/posts
POST   /api/v1/communities/{path}/posts
GET    /api/v1/leaderboard?community=&period=

GET    /api/v1/admin/metrics/overview           DAU, completion, drop-off, popular paths
GET    /api/v1/admin/users
GET    /api/v1/admin/content
```

---

## 6. Folder Structure

```
techlaunchpad/
├── ARCHITECTURE.md
├── README.md
├── docker-compose.yml
├── .env.example
├── infra/                         # terraform-ready stubs, deploy notes
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/                  # config, security, rate_limit, logging
│   │   ├── db/                    # base, session, deps
│   │   ├── models/                # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── api/
│   │   │   └── v1/                # one router module per domain
│   │   ├── services/               # business logic per domain
│   │   ├── ai/                     # LLMClient, providers, prompts, output schemas
│   │   ├── seed/                   # seed_data.py + content fixtures (json/yaml)
│   │   └── middleware/             # audit log, rate limit, error envelope
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/                    # App Router routes
│   │   │   ├── (marketing)/        # landing + public pages
│   │   │   ├── (auth)/
│   │   │   ├── onboarding/
│   │   │   ├── assessment/
│   │   │   ├── dashboard/
│   │   │   ├── roadmap/
│   │   │   ├── mentor/
│   │   │   ├── projects/
│   │   │   ├── portfolio/
│   │   │   ├── mentors/
│   │   │   ├── community/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn primitives
│   │   │   ├── charts/             # skill graph, readiness radial, etc.
│   │   │   └── shared/
│   │   ├── lib/                    # api client, auth, utils
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   └── tests/
└── docs/
    ├── API.md
    └── PHASE_2.md
```

---

## 7. UI/UX Direction

- **Visual language:** dark-first premium neutral palette (near-black `#0B0D12` base, warm off-
  white text, a single confident accent — electric indigo `#5B6CFF` — used sparingly for primary
  actions and progress fills), generous whitespace, 8px spacing scale, Inter/Geist for UI text,
  a monospace accent font for code/skill-tags. No gradients-as-decoration, no stock "AI orb"
  imagery.
- **Motion:** subtle (150–220ms) transitions on state changes only — progress bars filling,
  cards entering, mission completion — never decorative looping animation.
- **Cards over tables.** Progress is always shown with a visual (radial score, segmented bar,
  graph) plus the number, never the number alone.
- **Empty states are designed, not blank.** Every empty list explains what will appear there and
  gives one action to fill it.
- **Low-bandwidth discipline:** server components for static content, route-level code
  splitting, images optional/lazy, a lesson "download for offline" affordance backed by a
  service worker cache, and a Lite Mode that disables non-essential animation and prefetching.

---

## 8. MVP Scope (this build)

See §3. In one sentence: a complete first-time-user loop from landing page to "I have an active
personalized roadmap, I did today's mission, I talked to my AI mentor, I have one portfolio item"
— fully real, fully working, on a real database, with every other system (marketplace, community,
admin, payments) present as real schema + working API + clearly marked frontend integration
point rather than a dead button.

## 9. Phase 2 Roadmap

See `docs/PHASE_2.md` — summary: live LLM provider swap-in, Stripe payments + mentor payouts,
full mentor/community/admin frontends, mobile app (React Native sharing the same API), offline-
first PWA with background sync, richer simulation engine with branching scenarios, B2B/cohort
accounts, localized content and payment rails for priority emerging markets, and a recommendation
feedback loop that retrains path-fit rule weights from outcome data (did users who matched X path
actually complete it / get hired).
