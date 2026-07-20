-- Grant freshness and verification metadata. Existing grant IDs and rows are preserved.

alter table public.grants
  drop constraint if exists grants_status_check,
  add column if not exists eligibility_summary text,
  add column if not exists eligible_organization_types text[],
  add column if not exists required_nonprofit_status text,
  add column if not exists eligible_locations text[],
  add column if not exists geographic_scope text,
  add column if not exists focus_areas text[],
  add column if not exists populations_served text[],
  add column if not exists minimum_annual_budget bigint,
  add column if not exists maximum_annual_budget bigint,
  add column if not exists minimum_request_amount bigint,
  add column if not exists maximum_request_amount bigint,
  add column if not exists award_min bigint,
  add column if not exists award_max bigint,
  add column if not exists rolling_deadline boolean not null default false,
  add column if not exists source_url text,
  add column if not exists requirements text[],
  add column if not exists required_documents text[],
  add column if not exists application_questions jsonb,
  add column if not exists verified_at timestamptz,
  add column if not exists application_open_date timestamptz,
  add column if not exists deadline_type text not null default 'unknown',
  add column if not exists deadline_timezone text,
  add column if not exists official_url text,
  add column if not exists next_review_at timestamptz,
  add column if not exists confidence_level text not null default 'low',
  add column if not exists invitation_only boolean not null default false,
  add column if not exists unsolicited_applications_accepted boolean,
  add column if not exists restrictions text[],
  add column if not exists typical_award bigint,
  add column if not exists verification_notes text;

alter table public.grants
  add constraint grants_status_check check (status in (
    'draft', 'open', 'upcoming', 'rolling', 'closed', 'expired', 'paused',
    'invitation_only', 'no_unsolicited_applications', 'recurring_unconfirmed',
    'archived', 'awarded'
  )),
  add constraint grants_deadline_type_check check (
    deadline_type in ('fixed', 'rolling', 'multiple_cycles', 'unknown')
  ),
  add constraint grants_confidence_level_check check (
    confidence_level in ('high', 'medium', 'low')
  );

create index if not exists grants_review_idx on public.grants (status, next_review_at);
create index if not exists grants_verified_idx on public.grants (verified_at);
