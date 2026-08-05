# Grant database replacement audit

Audit date: 2026-08-05  
Supabase project: `xtfbkuxbphcnfklzvpgm`

## Current schema

`public.grants` uses a text primary key and currently contains 202 rows. Core display fields are `title`, `description`, `funder`, `category`, `region`, `status`, `amount`, `deadline`, and `application_url`. Later migrations added structured eligibility, award ranges, rolling-deadline metadata, source URLs, verification timestamps, lifecycle status, and review metadata.

Live quality baseline:

- 202 total grants
- 0 active grants
- 0 verified grants
- 202 records without `source_url` or `official_url`
- 181 records without a deadline
- 13 records with a past deadline
- all current records are intentionally hidden by `is_active = false`

The grants table has RLS enabled and a public read policy for `anon` and `authenticated`. Before this work, both roles still had broad table privileges, although RLS prevented writes because no write policy existed. The ingestion migration explicitly revokes write and truncate privileges from public application roles.

## Referencing tables

The following live tables contain a text `grant_id` column:

- `saved_grants`
- `applications`
- `generated_proposals`
- `grant_match_snapshots`
- `ai_generation_records`

The live database currently has no foreign-key constraints from those columns to `grants`. Applications also retain snapshot fields such as grant title, funder, category, and application URL. The absence of foreign keys reduces database-level integrity and means destructive replacement could silently orphan user records.

Current dependent row counts:

- Saved grants: 0
- Applications: 3
- Generated proposals: 0
- Grant match snapshots: 15
- Application sections: 14
- AI generation records: 4

The replacement design therefore keeps stable source-derived IDs, archives unmatched grants, and never deletes user-linked history during promotion or rollback.

## Current data flow

`lib/grants/queries.ts` loads and merges three catalogs on each request:

1. active and verified rows from Supabase;
2. results fetched live from the Simpler.Grants.gov API;
3. results fetched live from California's CKAN API.

`lib/grants/status.ts` filters local rows by lifecycle and verification status, but it intentionally exempts live API records that do not carry local verification metadata. Consequently external records can appear without passing a durable ingestion audit, deduplication, or review run.

Existing write paths include `scripts/seed-grants.mjs` and `scripts/import-verified-grants.mjs`. `scripts/generate-grants-json.mjs` generates synthetic-looking records and application URLs and must not be used for production ingestion. There is no existing cron, scheduler, protected ingestion route, or admin review dashboard.

## Existing source integrations

- Simpler.Grants.gov: official API, server-side API key, broad request-time search.
- California Grants Portal: official California Open Data CKAN resource, but the current adapter does not filter loans, business-only records, or nonprofit eligibility before display.
- Local JSON catalog: historically generated and imported by maintenance scripts.

No existing adapter provides persistent provenance, run-level counts, rejection reasons, exact rollback, or transactional promotion.

## Environment and server boundaries

The browser receives only `NEXT_PUBLIC_SUPABASE_URL` and the public/publishable key. Maintenance scripts use `SUPABASE_SERVICE_ROLE_KEY` server-side. `SIMPLER_GRANTS_API_KEY` is also server-only. The new pipeline validates these variables at startup and never logs their values.

## Risks

1. Live external records bypass the database verification lifecycle.
2. Existing records are low-confidence and have no recorded first-party source.
3. Text grant references are not protected by foreign keys.
4. A truncate-and-reload would risk user history and rollback readiness.
5. Existing synthetic seed generation can create plausible but unverified URLs.
6. California's official dataset includes loans, individuals, businesses, and other non-nonprofit opportunities.
7. California's current `robots.txt` disallows `/api/`, despite the portal advertising an API; the source is disabled pending clarification.
8. Supabase security advisors still report leaked-password protection disabled and generic anonymous-role warnings on several user tables; these are tracked separately from ingestion.

## Required migration

`20260805192757_grant_ingestion_pipeline.sql`:

- extends `grants` with canonical provenance, eligibility, verification, geography, funding, contact, hash, and raw-audit fields;
- adds data-quality constraints and discovery indexes;
- creates `grant_ingestion_runs`;
- creates isolated `grants_ingestion_staging`;
- creates `grant_ingestion_rejections` as the review queue;
- creates `grant_ingestion_backups`;
- creates `grant_related_table_backups` for service-role-only snapshots of every dependent grant table;
- creates `grant_id_mappings`;
- enables RLS and revokes `anon`/`authenticated` access to all internal tables;
- creates service-role-only, transaction-scoped promotion and rollback RPCs;
- uses an advisory transaction lock to prevent concurrent promotion or rollback.

## Rollback strategy

Promotion stores the complete pre-promotion `grants` rows as JSONB, keyed by run ID and grant ID, and snapshots saved grants, applications, generated proposals, match snapshots, application sections, and AI generation records before any upsert or archive. Rollback restores every backed-up grant row using the live table composite type. New records introduced by the promoted run are archived rather than deleted, preserving any references created after promotion; dependent tables are never mutated by either operation.

## Recommended implementation order

1. Review and apply the schema migration.
2. Run a new dry ingestion and inspect the generated report.
3. Stage the exact reviewed run.
4. Inspect accepted rows, rejections, duplicate candidates, and validation gates.
5. Promote only after explicit authorization.
6. Verify production counts, discovery queries, and dependent references.
7. Retain the backup until the replacement is formally accepted.
8. Enable scheduling only after a successful manually reviewed cycle.
