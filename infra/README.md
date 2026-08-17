# Infrastructure

This directory is the integration point for cloud deployment. The
application is deliberately deployment-target-agnostic (two Dockerfiles +
Postgres), so it can run on:

- **Simple path:** Render / Railway / Fly.io — point each at its
  respective Dockerfile, add a managed Postgres instance, set the env vars
  from `.env.example`.
- **AWS:** ECS Fargate (one service per Dockerfile) + RDS Postgres + an ALB.
  A `main.tf` here would define: VPC, RDS instance, ECS cluster/services,
  ALB + target groups, and Secrets Manager entries for `JWT_SECRET_KEY` /
  `ANTHROPIC_API_KEY` / `STRIPE_SECRET_KEY`.
- **Frontend-specific:** the Next.js app also deploys cleanly to Vercel on
  its own if you prefer to split frontend/backend hosting — just set
  `NEXT_PUBLIC_API_URL` to the deployed backend URL.

## Production domain

The production domain is **mycareerfound.com** — registered, but not yet
pointed at any host (no DNS records configured). Once a deployment target
is chosen from the options above:

1. Point the domain's DNS at the chosen platform (A/CNAME per that
   platform's docs — e.g. Vercel's domain UI, Render's custom domain
   setup, or an ALB alias for the AWS path).
2. Set `FRONTEND_ORIGIN=https://mycareerfound.com,https://www.mycareerfound.com`
   and `PUBLIC_APP_URL=https://mycareerfound.com` on the backend — see
   `../.env.production.example`.
3. Set `NEXT_PUBLIC_API_URL` on the frontend to the backend's public URL
   (its own subdomain, e.g. `api.mycareerfound.com`, or the same domain if
   reverse-proxied) — see `../frontend/.env.production.example`.
4. If "Continue with Google" is enabled, add `https://mycareerfound.com`
   (and `www`) to the OAuth client's Authorized JavaScript origins.

This is all prep, not action — no DNS changes, secrets, or the current
Docker Compose / local-dev setup are touched here. It's ready to wire in
once hosting is actually chosen.

## Why no Terraform files are checked in yet

Writing Terraform against infrastructure that doesn't exist yet (no AWS
account, no chosen region/provider) produces untestable, likely-wrong code.
This directory is the intentional integration point: once a target cloud
account and provider are chosen, add `main.tf` / `variables.tf` /
`outputs.tf` here following the resource list above, and wire
`docker-compose.yml`'s services 1:1 to the Terraform-provisioned equivalents.

## Secrets management

Every secret the app needs is listed in `.env.example` and read exclusively
through `backend/app/core/config.py`. In production, none of these should
live in a `.env` file — inject them via your platform's secrets manager
(AWS Secrets Manager, Fly secrets, Render environment groups, etc.) as
environment variables at deploy time.

## CI/CD

A minimal GitHub Actions-ready pipeline for this repo would: run
`pytest` (backend) and `npm run build && npm test` (frontend) on every PR,
build and push both Docker images on merge to `main`, then trigger a deploy
on the chosen platform. Add `.github/workflows/ci.yml` here once a CI
provider is selected.
