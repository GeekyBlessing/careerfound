# Launch checklist

What has to be true in production before CareerFound is announced. Each item says how to check it.

## Must be done by the owner (secrets and dashboards)

1. **Email delivery.** Follow `docs/EMAIL_SETUP.md`: the domain must resolve and be verified in Resend, then set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and `PUBLIC_APP_URL` on the API service. Check: the deploy log must not contain "EMAIL NOT SENT" or "CONFIGURATION PROBLEM", and a real signup must receive its verification email. Until this is done, verification emails, welcome emails, mentorship and consultation request confirmations and the team notifications are not delivered. Requests are still saved in the database.
2. **Sample accounts.** Older databases hold `admin@careerfound.dev`, `demo@careerfound.dev` and `newuser@careerfound.dev`, created before production stopped seeding them. Their passwords are in the repository history. Change the admin password or delete the accounts. The deploy log prints a WARNING for each one that still accepts the published password.
3. **AI provider.** Open `/api/v1/config` on the API. If `ai_provider` is `mock`, the AI Mentor and project reviewer use prepared answers. Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` to go live. The AI Mentor page shows a "Limited mode" note while it is `mock`.
4. **Database access.** Restrict the Postgres allow list in Render. A rule for `0.0.0.0/0` lets anyone on the internet try to connect.
5. **Payments.** Nothing is charged anywhere. Stripe or a regional processor still has to be integrated (see `PHASE_2.md`). Until then every paid service starts as a request that the team follows up by email.

## Behaviour to keep in mind

- `ENVIRONMENT=production` never creates sample accounts or sample community posts. Set `SEED_DEMO_DATA=true` only on a throwaway environment.
- Mentor requests and questions email the team inbox (`EMAIL_REPLY_TO`) and the mentor when a verified address is on file. The response carries `team_notified` so the page can say when that email failed.
- Only Cybersecurity and Software Engineering have full lessons, exercises and quizzes. The Project Lab exists for Cybersecurity. The other 46 careers have a three phase roadmap and three projects, and the product says so.
