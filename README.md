# Grantclient

Grantclient is a free, public web application that helps nonprofits discover
funding opportunities, prepare grant applications with AI-assisted drafting,
and track submissions in one place.

**Live website:** [grantclient.com](https://grantclient.com)

## Features

- Grant discovery and deterministic organization-to-grant matching
- Factual AI-assisted match explanations
- Guided proposal setup and section-by-section drafting
- Saved grants and application-status tracking
- Organization profiles and private document storage
- Email and Google authentication

AI-generated content is assistive and should be reviewed and verified before
being included in a grant application.

## Prerequisites

- Node.js 22.12+
- npm 10+

## Local development

```bash
npm install
cp .env.example .env.local   # if .env.local does not exist yet
# Edit .env.local with your Supabase, Google OAuth, and API values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The production application is hosted at
[https://grantclient.com](https://grantclient.com). Production secrets and
environment-specific values should be configured in the hosting provider, not
committed to this repository.

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

### Google OAuth redirects

Set `NEXT_PUBLIC_SITE_URL=https://www.grantclient.com` in the production hosting
environment. In Supabase **Authentication > URL Configuration**, set:

- Site URL: `https://www.grantclient.com`
- Redirect URL: `https://www.grantclient.com/auth/callback`

Keep `http://localhost:3000/auth/callback` as an additional redirect URL only
for local development. Supabase falls back to its Site URL when an OAuth
`redirectTo` value is not allowlisted, so a localhost Site URL will send
production users back to localhost after Google sign-in.

### NVIDIA NIM

1. Open the [NVIDIA API Catalog](https://build.nvidia.com/), select a chat-completion model, choose **Get API Key**, and generate a key.
2. Add the key and the selected model identifier to `.env.local`:

```bash
NVIDIA_API_KEY=your-key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=the-model-id-from-nvidia
```

3. In Vercel, add the same three values under **Project Settings > Environment Variables**. Keep them server-only; never prefix the key with `NEXT_PUBLIC_`.

Choose a text model that supports OpenAI-compatible chat completions and JSON output. The model identifier must exactly match the identifier shown in NVIDIA's API reference for that model.

## Grant matching architecture

Recommendations are deterministic. Grantclient first removes grants that clearly fail a stored deadline, status, organization type, nonprofit status, geography, budget, or funding-range requirement. Missing restrictions do not disqualify an organization; they create verification warnings.

Eligible grants receive a versioned 0-100 score calculated in TypeScript:

| Component | Points |
|---|---:|
| Focus-area alignment | 25 |
| Population alignment | 20 |
| Geographic alignment | 15 |
| Funding-range compatibility | 15 |
| Mission and program term alignment | 10 |
| Organization-size fit | 5 |
| Eligibility confidence | 5 |
| Deadline practicality | 5 |

The dashboard sorts by score, then by deadline, and displays at most five grants. NVIDIA does not determine eligibility or numeric scores. A manual refresh can generate one cached batch of concise explanations for the displayed grants. If NVIDIA is unavailable or unconfigured, deterministic recommendations and factual reasons remain available.

## Proposal drafting

Applications start with project-specific setup; organization facts are reused from the saved profile. Grantclient creates a fourteen-section proposal template and deterministically fills cover information and the attachment checklist. Narrative sections are generated individually and saved immediately. Each request contains only fields declared by that section's template and has a strict word/token limit. Missing facts produce `[NEEDS INPUT: ...]` markers instead of invented content.

Token usage is controlled by filtering before AI, batching match explanations, caching by organization/grant/model/prompt versions, truncating non-critical context, omitting uploaded documents, limiting output tokens, and never sending unrelated sections or conversation history.

## Database migrations

Create and test schema changes locally before applying them to a hosted project:

```bash
supabase migration list --local
supabase db reset
```

The matching migration preserves existing data, enables RLS on every new public table, and adds explicit Data API grants required by current Supabase projects.

## Pre-push checks

Run checks manually before pushing:

```bash
npm run pre-push
```

A `pre-push` Git hook is installed at `.git/hooks/pre-push` to run these checks automatically.

## Support

For product or account support, email
[support@grantclient.com](mailto:support@grantclient.com).
