# Grant ingestion runbook

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by ingestion scripts
- `SIMPLER_GRANTS_API_KEY`: official Simpler.Grants.gov API key

Never prefix the service-role or source API key with `NEXT_PUBLIC_`. Keep `.env.local` out of Git.

## Initial setup

1. Review `supabase/migrations/20260805192757_grant_ingestion_pipeline.sql`.
2. Apply migrations with `supabase db push`.
3. Run Supabase security and performance advisors.
4. Confirm internal ingestion tables are inaccessible to `anon` and `authenticated`.

## Dry run

```bash
npm run grants:ingest
```

This fetches enabled sources, validates and deduplicates records, reads production counts, and replaces `docs/grant-ingestion-dry-run-report.md`. It does not write staging or production grant rows.

To run one enabled source:

```bash
npm run grants:ingest -- --source=simpler_grants_gov
```

To limit records while developing:

```bash
npm run grants:ingest -- --limit=100
```

## Verification-only run

```bash
npm run grants:verify
```

The current verification command performs a fresh dry run against the enabled official source and does not write production.

## Stage a reviewed catalog

```bash
npm run grants:stage
```

Staging is blocked automatically when a fatal gate fails. Inspect:

- `grant_ingestion_runs`
- `grants_ingestion_staging`
- `grant_ingestion_rejections`

Internal tables require the service role and are not available to normal application users.

`grants:stage` is a full-rebuild staging run. The explicit equivalent is:

```bash
npm run grants:full-rebuild
```

For a non-destructive incremental staging run that upserts verified records but does not archive records absent from the latest source response:

```bash
npm run grants:incremental
```

## Promote

```bash
npm run grants:promote -- --run-id=<approved-run-uuid>
```

Promotion requires a validated run with status `staged`. It backs up every existing grant, snapshots all dependent grant-related tables, upserts staging, archives unmatched records, preserves stable IDs, and records counts in one transaction.

## Roll back

```bash
npm run grants:rollback -- --run-id=<promoted-run-uuid>
```

Rollback restores all backed-up rows. Records added by the run are archived rather than deleted so references created after promotion remain resolvable.

## Disable a source

Set its `enabled` property to `false` in `lib/grants/ingestion/config.ts`, update the compliance reason and review date, run tests, and perform a dry run. Never disable the only source immediately before promotion without reviewing the row-count gate.

## Add an authorized source

1. Document official ownership, API or dataset URL, robots result, terms, rate limits, and review date.
2. Add the source to `SOURCE_ALLOWLIST` disabled by default.
3. Implement an independent adapter.
4. Add malformed, ineligible, expired, and valid fixtures.
5. Enable only after compliance and test review.
6. Run a dry ingestion and inspect all new rejection categories and duplicate candidates.

## Investigate failures

- `401`: verify the source API key or Supabase service-role key without printing it.
- `429`: stop the source, honor `Retry-After`, and lower the configured request rate.
- repeated `403`: disable the source and review authorization; do not attempt evasion.
- schema validation failures: compare fixtures and the official API schema before changing normalization.
- validation gate failure: inspect the dry-run report; never bypass a fatal gate in production.
- staging permission error: verify the migration was applied and service-role grants exist.
- promotion failure: the transaction rolls back automatically; inspect the run and database logs.

## User-linked record preservation

Promotion never truncates `grants` and never modifies saved grants, applications, generated proposals, snapshots, sections, or AI records. Unmatched grants are archived. The complete pre-promotion grant table is retained in `grant_ingestion_backups`; dependent records are retained in `grant_related_table_backups` until an authorized operator decides they can be removed.
