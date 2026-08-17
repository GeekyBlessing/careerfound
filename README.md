# CareerFound — Tech Career Launchpad

> "You don't need to figure out your entire future today. You just need to know your next step."

CareerFound takes a complete beginner from **confused → discovered → learning →
building → portfolio → job-ready**. It's not a course catalog — it's an AI
career advisor, personalized roadmap generator, project-based accelerator,
and employability tracker in one product.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full product & technical
architecture, [`docs/API.md`](./docs/API.md) for the API reference, and
[`docs/PHASE_2.md`](./docs/PHASE_2.md) for what's next.

## Quick start (Docker — recommended)

```bash
cp .env.example .env
# generate a real secret: python -c "import secrets; print(secrets.token_urlsafe(64))"
# paste it into JWT_SECRET_KEY in .env

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (interactive docs at `/docs`)
- The backend container runs migrations and seeds demo data automatically on
  first boot.

### Demo accounts (seeded automatically)

| Email | Password | Notes |
|---|---|---|
| `demo@careerfound.dev` | `DemoPass123!` | Mid-progress user, active Cybersecurity roadmap |
| `newuser@careerfound.dev` | `NewUser123!` | Brand-new user, no roadmap yet — good for testing onboarding |
| `admin@careerfound.dev` | `AdminPass123!` | Admin dashboard access |

## Quick start (without Docker)

**Backend:**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Uses a local sqlite file by default — no Postgres needed for local dev.
alembic upgrade head
python -m app.seed.seed_data
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Going live with real AI

Every AI feature (career assessment analysis, AI mentor, project reviewer,
portfolio copywriter) runs on a `MockLLMProvider` by default — realistic,
personalized, structured responses with zero API key required, so the whole
product is fully clickable today. To go live:

```bash
# in .env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

No route or frontend code changes are needed — see
`backend/app/ai/client.py` and `ARCHITECTURE.md §1.2`.

## Production domain

CareerFound's production domain is **mycareerfound.com**. DNS/hosting for
it aren't connected yet, but the codebase is ready to point at it once a
platform is chosen (see `infra/README.md`):

- Backend: `FRONTEND_ORIGIN=https://mycareerfound.com,https://www.mycareerfound.com`
  and `PUBLIC_APP_URL=https://mycareerfound.com` — see `.env.production.example`.
- Frontend: `NEXT_PUBLIC_API_URL` pointed at wherever the backend ends up
  hosted — see `frontend/.env.production.example`.
- If "Continue with Google" is turned on, add the domain to the OAuth
  client's Authorized JavaScript origins in Google Cloud Console.

None of this changes local dev (`.env.example` still defaults to
`localhost`) or the current Docker Compose setup — it's staged for the
deploy step, not applied automatically.

## What's fully built vs. architected

**Fully working end-to-end** (real database, real API, real UI): landing
page, auth, onboarding, the "Find Your Tech Path" AI assessment (Best
Match / Strong Alternative / Wild Card + Career DNA radar chart),
personalized roadmaps (fully authored for Cybersecurity and Software
Engineering), the "What should I do today?" mission engine, skill graph,
Tech Readiness Score, the AI mentor chat, the project system (step-by-step
guidance + AI code review), and the portfolio builder.

**Real schema + working API, lighter frontend** (clearly marked, not fake
buttons): mentorship marketplace (booking works, payment capture is a
documented Phase 2 integration point), community, admin metrics, and
real-world simulations.

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript (strict mode), Tailwind
  CSS, hand-rolled shadcn-style primitives, zero browser-storage dependency
  beyond the documented auth-token tradeoff (see `lib/api.ts`).
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2, JWT
  auth with bcrypt password hashing.
- **Database:** PostgreSQL in Docker (sqlite fallback for zero-setup local
  dev — same models, same migrations).
- **AI:** Provider-abstracted LLM client (`backend/app/ai/`) with structured
  Pydantic-validated outputs and a prompt-injection heuristic guard.
- **Infra:** Docker Compose, Dockerfiles for both services, Alembic
  migrations, `infra/` stub for Terraform-based cloud deployment.

## Tests

```bash
# Backend
cd backend && source venv/bin/activate && pytest

# Frontend
cd frontend && npm test          # vitest unit tests
node scripts/smoke-test.mjs      # real-browser E2E smoke test (needs both servers running + seeded)
```

## Security

Password hashing (bcrypt), JWT auth, per-endpoint rate limiting (auth +
AI endpoints), input validation on every request (Pydantic), an audit log
table for security-relevant actions, a prompt-injection heuristic guard on
every AI endpoint, quiz answer keys are never sent to the client, and secrets
are read exclusively from environment variables (`backend/app/core/config.py`)
— never hardcoded, never exposed to the frontend. See `docs/PHASE_2.md` for
the documented httpOnly-cookie hardening upgrade.

## Repository layout

See `ARCHITECTURE.md §6` for the full annotated folder structure.
