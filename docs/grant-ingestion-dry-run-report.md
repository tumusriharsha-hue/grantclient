# Grant ingestion dry-run report

Generated: 2026-08-05T20:17:35.442Z  
Run ID: `e8c19658-4a48-4c76-9d2b-92fedb3d998f`  
Production promotion performed: **No**

## Sources checked

- simpler_grants_gov: official_api; The official developer portal authorizes programmatic catalog search and publishes limits of 60 requests/minute and 10,000/day per key.

## Sources excluded

- california_grants_portal: The official dataset advertises an API, but robots.txt currently disallows /api/. Disabled pending written clarification from the California State Library.

## Data quality summary

| Metric | Count |
| --- | ---: |
| Fetched | 763 |
| Normalized | 542 |
| Accepted | 542 |
| Rejected | 221 |
| Exact duplicates removed | 0 |
| Ambiguous duplicate candidates | 0 |
| Verified | 542 |
| Open | 539 |
| Upcoming | 0 |
| Rolling | 3 |

### Fetched by source

- simpler_grants_gov: 763

### Rejection categories

- INVALID_RECORD: 10
- NONPROFIT_NOT_ELIGIBLE: 211

### Geographic distribution

- United States: 542

### Focus-area distribution

- Agriculture: 10
- Arts: 9
- Business And Commerce: 11
- Community Development: 6
- Consumer Protection: 3
- Disaster Prevention And Relief: 3
- Education: 135
- Energy: 2
- Environment: 50
- Food And Nutrition: 33
- Health: 400
- Housing: 3
- Humanities: 3
- Income Security And Social Services: 86
- Information And Statistics: 1
- Law Justice And Legal Services: 12
- Natural Resources: 20
- Opportunity Zone Benefits: 7
- Other: 11
- Recreation And Tourism: 1
- Regional Development: 1
- Science Technology And Other Research And Development: 16
- Transportation: 7

### Funding-range distribution

- $100k–$499,999: 89
- $1m+: 87
- $25k–$99,999: 15
- $500k–$999,999: 65
- Under $25k: 23
- Unknown: 263

## Missing-field percentages

- Deadline: 0.00%
- Award range: 48.52%
- Geographic scope: 0.00%
- Focus areas: 0.00%
- Application requirements: 100.00%
- Required documents: 100.00%

## Existing production comparison

| Metric | Existing | Proposed |
| --- | ---: | ---: |
| Grant rows | 202 | 542 |
| Active grants | 0 | 542 |
| Verified grants | 0 | 542 |

Existing grant-ID checksum: `691af45d115aad79e56465793a6dda708859001c0baa8cedc6229052d2c1d807`

## Dependent references

- Saved grants: 0
- Applications: 3
- Generated proposals: 0
- Grant match snapshots: 15
- Application sections: 14
- AI generation records: 4

Promotion preserves all existing IDs, archives rows not present in staging, and never deletes user application or saved-grant history.

## Validation gates

| Gate | Result | Actual | Required |
| --- | --- | --- | --- |
| minimum_record_count | PASS | 542 | >= 25 |
| nonprofit_eligibility | PASS | 100% | >= 95% |
| source_url | PASS | 100% | 100% |
| valid_status | PASS | 542 | 542 |
| future_deadline_or_rolling | PASS | 542 | 542 |
| duplicate_source_ids | PASS | 0 | 0 |
| duplicate_application_urls | PASS | 0 | 0 |
| funding_ranges | PASS | 0 | 0 invalid |
| enabled_sources_only | PASS | 0 | 0 disabled-source records |
| row_count_change | PASS | 168.32% | <= 500% |
| fatal_errors | PASS | 0 | 0 |

Overall result: **PASS**

Broken-link count: 0 detected structurally. The enabled official API is the verification authority; individual HTML crawling was not used.

Detailed rejected records and duplicate candidates: `data/audits/grant-ingestion-dry-run.json`

## Promotion procedure

The first pass intentionally stops before staging or production promotion.

1. Apply the reviewed migration: `supabase db push`
2. Stage a fresh validated run: `npm run grants:stage`
3. Review `grant_ingestion_runs`, `grants_ingestion_staging`, and `grant_ingestion_rejections`.
4. Copy the run ID emitted by the staging command and promote only that approved staged run: `npm run grants:promote -- --run-id=<approved-staged-run-id>`

## Rollback command

After promotion, roll back that exact run with:

`npm run grants:rollback -- --run-id=<promoted-run-id>`
