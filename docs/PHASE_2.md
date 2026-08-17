# Phase 2 Roadmap

This build is a real, working MVP — not a mockup. The items below are what
turn it into a serious global platform, roughly in priority order.

## 1. Go live with a real LLM

Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` — the entire AI
abstraction layer (`backend/app/ai/`) is already wired for this; no route or
frontend code changes needed. Recommended follow-ups once live:
- Add response caching for repeated/near-duplicate mentor questions.
- Add an evaluation harness that scores AI mentor/reviewer output quality on
  a fixed set of golden examples, run in CI.
- Tune prompts per-path (a Cybersecurity mentor persona vs. a Design mentor
  persona) rather than one shared system prompt.

## 2. Harden authentication

- Move the access/refresh tokens from `localStorage` to httpOnly,
  `SameSite=strict` cookies issued by the backend, plus CSRF token
  protection for state-changing requests. This is the single highest-value
  security upgrade — see the note in `frontend/src/lib/api.ts`.
- Implement real Google OAuth token verification in
  `backend/app/api/v1/auth.py::google_auth` (the endpoint and frontend flag
  already exist, gated by `GOOGLE_OAUTH_CLIENT_ID`).
- Add email verification and password-reset flows.

## 3. Payments

Wire Stripe (or, for the emerging-market focus, a regional processor like
Flutterwave/Paystack) into `backend/app/services/marketplace_service.py`'s
`_charge_placeholder` and add a subscription billing flow for the Pro plan.
Add webhook handling with signature verification, stored via
`STRIPE_WEBHOOK_SECRET`.

## 4. Full frontends for marketplace, community, and admin

These currently have complete, real backend APIs and functional but minimal
frontends. Phase 2 should add: mentor profile pages with calendar-based
availability, richer community features (comments UI, challenge threads,
study groups), and a full admin console (content authoring UI for
lessons/projects/quizzes instead of editing seed files directly).

## 5. Content expansion

Two paths (Cybersecurity, Software Engineering) are fully authored end to
end. Extend the same phase/lesson/project/quiz structure
(`backend/app/seed/roadmap_content.py`) to the remaining 19 career paths.

## 6. Mobile app

The API is already a clean, versioned REST surface — a React Native app can
share it directly. Prioritize offline lesson caching and low-bandwidth mode
for the emerging-markets audience described in the product brief.

## 7. Offline-first PWA

Add a service worker for "download lesson for offline," background sync of
completed-offline progress, and a Lite Mode that disables animation/prefetch
for constrained connections.

## 8. Recommendation feedback loop

Track outcomes (did a user who got "Best Match: Cybersecurity" actually
complete the roadmap / report getting hired) and use that signal to retrain
the `path_fit_rules` weights instead of the current hand-tuned heuristic in
`backend/app/ai/providers.py::_score_paths`.

## 9. B2B / cohorts

Org accounts, seat-based billing, cohort dashboards for bootcamps/university
partners, and sponsor-funded scholarship codes redeemable for Pro plan
access — architecture already supports adding an `organizations` table with
a foreign key on `users` without disrupting the existing schema.

## 10. Observability

Structured logging is in place (`app/main.py` exception handlers); add
request tracing, an APM integration, and dashboards for the admin metrics
already computed in `admin_service.py`.
