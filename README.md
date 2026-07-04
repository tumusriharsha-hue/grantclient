# GrantClient

Grants made simple for nonprofits — discover funding, draft applications, and track submissions.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local   # if .env.local does not exist yet
# Edit .env.local with your Supabase, Google OAuth, and API values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run pre-push` | Secret scan, lint, and build checks before pushing |

## Environment variables

See `.env.example` for all supported variables. Copy it to `.env.local` and fill in real values.

**Never commit** `.env.local` or any file containing secrets. The service role key and OAuth client secret must stay server-side only.

## Pre-push checks

Run checks manually before pushing:

```bash
npm run pre-push
```

A `pre-push` Git hook is installed at `.git/hooks/pre-push` to run these checks automatically.
