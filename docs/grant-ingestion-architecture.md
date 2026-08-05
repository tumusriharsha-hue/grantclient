# Grant ingestion architecture

## Objective

The pipeline converts records from an explicit source allowlist into a canonical nonprofit-grant model, validates each record, removes exact duplicates, reports uncertain duplicates, and optionally stages an approved run. Production promotion is a separate transaction and is never part of a dry run.

## Components

```text
Official source adapter
  -> runtime schema validation
  -> normalization
  -> nonprofit eligibility and status validation
  -> deterministic deduplication
  -> validation gates
  -> dry-run report
  -> optional service-role staging
  -> reviewed transactional promotion
  -> retained backup / rollback
```

Implementation modules are under `lib/grants/ingestion/`:

- `adapters/`: one independent adapter per source;
- `normalize/`: dates, funding, state codes, URLs, HTML removal, hashes;
- `validate/`: record rejection and run-level promotion gates;
- `deduplicate/`: exact identifiers and review-only fingerprints;
- `persistence/`: service-role-only Supabase reads, staging, promotion, rollback;
- `config.ts`: source allowlist and safety thresholds;
- `pipeline.ts`: orchestration;
- `report.ts`: deterministic Markdown report generation.

The CLI entry point is `scripts/grants/ingestion/run-ingestion.ts`.

## Canonical identity

Every source adapter produces a stable ID from `source + source_record_id`. Simpler.Grants.gov IDs are `simpler-grants-gov-<opportunity_uuid>`. The promotion process does not remap existing user references. Records absent from an approved run are archived, not removed.

## Verification policy

An accepted record must:

- originate from an enabled allowlisted source;
- explicitly list nonprofits as eligible;
- have valid HTTPS source and application URLs;
- be verified through an official API or dataset;
- be open, upcoming, or rolling;
- have a future deadline unless rolling status is explicitly supported;
- have a valid funding range;
- pass exact duplicate checks.

Unknown values remain `null` or empty and are never invented. A valid URL alone is not treated as verification; the official source record must identify the same opportunity and eligibility.

## Deduplication

Exact duplicates are checked in this order:

1. source plus source record ID;
2. canonical source URL;
3. canonical application URL.

The review fingerprint combines normalized funder, grant name, deadline, and geographic scope. Fingerprint collisions are reported for review and are not automatically merged.

## Persistence and transactions

Internal ingestion tables use RLS with no client policies, and all `anon` and `authenticated` privileges are revoked. The service role is required for staging. Normal users cannot write grant verification fields.

Promotion is one Postgres transaction. It:

1. acquires an advisory transaction lock;
2. locks and validates the run row;
3. verifies staging is non-empty;
4. backs up every current grant row and snapshots every dependent grant-related table;
5. upserts staged records;
6. archives unmatched records;
7. records stable ID mappings and run counts;
8. commits atomically.

Full-rebuild promotion archives catalog records absent from staging. Incremental promotion only upserts staged records and leaves all absent catalog rows unchanged.

Rollback obtains the same lock, archives newly introduced records, restores the complete backup, and marks the run rolled back.

## Scheduling

No production schedule is created in the first pass. After the first reviewed promotion, the preferred scheduler is a GitHub Actions workflow or protected Vercel cron endpoint that invokes staging only. Promotion should remain a separately authorized action. Any HTTP schedule endpoint must require a secret and must never accept a run ID from an unauthenticated caller.
