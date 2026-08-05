-- Canonical grant-ingestion schema, isolated staging data, transactional
-- promotion, and rollback. This migration does not change existing grant rows.

alter table public.grants
  alter column amount type bigint using amount::bigint,
  add column if not exists source text,
  add column if not exists source_record_id text,
  add column if not exists source_application_url text,
  add column if not exists funder_type text,
  add column if not exists summary text,
  add column if not exists nonprofit_eligible boolean,
  add column if not exists requires_501c3 boolean,
  add column if not exists fiscal_sponsor_allowed boolean,
  add column if not exists eligible_states text[],
  add column if not exists eligible_counties text[],
  add column if not exists eligible_countries text[],
  add column if not exists target_populations text[],
  add column if not exists program_types text[],
  add column if not exists estimated_award bigint,
  add column if not exists total_funding_available bigint,
  add column if not exists currency text not null default 'USD',
  add column if not exists letter_of_intent_deadline date,
  add column if not exists recurring boolean not null default false,
  add column if not exists frequency text,
  add column if not exists matching_funds_required boolean,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_method text,
  add column if not exists last_checked_at timestamptz,
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists content_hash text,
  add column if not exists raw_source_data jsonb;

alter table public.grants drop constraint if exists grants_status_check;
alter table public.grants
  add constraint grants_status_check check (status in (
    'draft', 'open', 'upcoming', 'rolling', 'awaiting_next_cycle', 'closed',
    'expired', 'archived', 'discontinued', 'invite_only', 'unverified',
    'awarded', 'paused'
  )),
  add constraint grants_verification_status_check check (
    verification_status in ('verified', 'partially_verified', 'unverified', 'failed')
  ),
  add constraint grants_currency_check check (currency ~ '^[A-Z]{3}$'),
  add constraint grants_canonical_amounts_check check (
    coalesce(estimated_award, 0) >= 0
    and coalesce(total_funding_available, 0) >= 0
  ),
  add constraint grants_visible_verification_check check (
    not is_active or (
      nonprofit_eligible is true
      and verification_status = 'verified'
      and source is not null
      and source_record_id is not null
      and source_url is not null
      and source_application_url is not null
      and verified_at is not null
      and last_checked_at is not null
    )
  );

create unique index if not exists grants_source_record_unique
  on public.grants (source, source_record_id)
  where source is not null and source_record_id is not null;
create index if not exists grants_visible_deadline_idx
  on public.grants (status, deadline)
  where is_active = true;
create index if not exists grants_nonprofit_verified_idx
  on public.grants (verification_status, deadline)
  where nonprofit_eligible = true;
create index if not exists grants_source_idx on public.grants (source);
create index if not exists grants_award_range_idx on public.grants (award_min, award_max);
create index if not exists grants_focus_areas_gin_idx on public.grants using gin (focus_areas);
create index if not exists grants_eligible_states_gin_idx on public.grants using gin (eligible_states);

revoke insert, update, delete, truncate on public.grants from anon, authenticated;
grant select on public.grants to anon, authenticated;
grant select, insert, update, delete on public.grants to service_role;

create table public.grant_ingestion_runs (
  id uuid primary key,
  mode text not null check (mode in ('dry_run', 'stage', 'verify', 'full_rebuild', 'incremental')),
  status text not null check (status in ('running', 'staging', 'staged', 'promoted', 'rolled_back', 'failed')),
  started_at timestamptz not null,
  completed_at timestamptz,
  promoted_at timestamptz,
  rolled_back_at timestamptz,
  sources_attempted text[] not null default '{}',
  source_counts jsonb not null default '{}'::jsonb,
  records_fetched integer not null default 0 check (records_fetched >= 0),
  records_normalized integer not null default 0 check (records_normalized >= 0),
  records_accepted integer not null default 0 check (records_accepted >= 0),
  records_rejected integer not null default 0 check (records_rejected >= 0),
  records_deduplicated integer not null default 0 check (records_deduplicated >= 0),
  records_inserted integer not null default 0 check (records_inserted >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  records_archived integer not null default 0 check (records_archived >= 0),
  validation_failures jsonb not null default '[]'::jsonb,
  validation_passed boolean not null default false,
  before_counts jsonb not null default '{}'::jsonb,
  after_counts jsonb not null default '{}'::jsonb,
  error_summary text,
  created_at timestamptz not null default now()
);

create table public.grants_ingestion_staging (
  run_id uuid not null references public.grant_ingestion_runs(id) on delete cascade,
  id text not null,
  source text not null,
  source_record_id text not null,
  source_url text not null,
  source_application_url text not null,
  grant_name text not null,
  funder_name text not null,
  funder_type text,
  description text not null,
  summary text,
  eligibility_summary text not null,
  eligible_organization_types text[] not null default '{}',
  nonprofit_eligible boolean not null,
  requires_501c3 boolean,
  fiscal_sponsor_allowed boolean,
  eligible_states text[] not null default '{}',
  eligible_counties text[] not null default '{}',
  eligible_countries text[] not null default '{}',
  geographic_scope text,
  focus_areas text[] not null default '{}',
  target_populations text[] not null default '{}',
  program_types text[] not null default '{}',
  minimum_award bigint,
  maximum_award bigint,
  estimated_award bigint,
  total_funding_available bigint,
  currency text not null default 'USD',
  deadline date,
  deadline_type text not null,
  opens_at timestamptz,
  letter_of_intent_deadline date,
  rolling boolean not null default false,
  recurring boolean not null default false,
  frequency text,
  matching_funds_required boolean,
  application_requirements text[] not null default '{}',
  required_documents text[] not null default '{}',
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null,
  verification_status text not null,
  verification_method text not null,
  verified_at timestamptz not null,
  last_checked_at timestamptz not null,
  first_seen_at timestamptz not null,
  published_at timestamptz,
  content_hash text not null,
  raw_source_data jsonb not null default '{}'::jsonb,
  category text not null,
  region text not null,
  created_at timestamptz not null default now(),
  primary key (run_id, id),
  unique (run_id, source, source_record_id),
  check (minimum_award is null or minimum_award >= 0),
  check (maximum_award is null or maximum_award >= coalesce(minimum_award, 0)),
  check (verification_status = 'verified'),
  check (nonprofit_eligible is true),
  check (rolling or deadline is not null)
);

create table public.grant_ingestion_rejections (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.grant_ingestion_runs(id) on delete cascade,
  source text not null,
  source_record_id text,
  source_url text,
  grant_name text,
  funder_name text,
  reason_code text not null,
  reason_detail text not null,
  conflicting_fields jsonb not null default '{}'::jsonb,
  duplicate_candidates jsonb not null default '[]'::jsonb,
  raw_source_data jsonb not null default '{}'::jsonb,
  recommended_action text,
  created_at timestamptz not null default now()
);

create table public.grant_ingestion_backups (
  run_id uuid not null references public.grant_ingestion_runs(id) on delete restrict,
  grant_id text not null,
  row_data jsonb not null,
  backed_up_at timestamptz not null default now(),
  primary key (run_id, grant_id)
);

create table public.grant_related_table_backups (
  run_id uuid not null references public.grant_ingestion_runs(id) on delete restrict,
  table_name text not null check (table_name in (
    'saved_grants', 'applications', 'generated_proposals',
    'grant_match_snapshots', 'application_sections', 'ai_generation_records'
  )),
  row_key text not null,
  row_data jsonb not null,
  backed_up_at timestamptz not null default now(),
  primary key (run_id, table_name, row_key)
);

create table public.grant_id_mappings (
  run_id uuid not null references public.grant_ingestion_runs(id) on delete cascade,
  old_grant_id text not null,
  new_grant_id text not null,
  mapping_reason text not null,
  created_at timestamptz not null default now(),
  primary key (run_id, old_grant_id),
  unique (run_id, new_grant_id)
);

create index grant_ingestion_runs_status_idx on public.grant_ingestion_runs (status, started_at desc);
create index grants_ingestion_staging_run_status_idx on public.grants_ingestion_staging (run_id, status, deadline);
create index grants_ingestion_staging_focus_gin_idx on public.grants_ingestion_staging using gin (focus_areas);
create index grant_ingestion_rejections_run_reason_idx on public.grant_ingestion_rejections (run_id, reason_code);

alter table public.grant_ingestion_runs enable row level security;
alter table public.grants_ingestion_staging enable row level security;
alter table public.grant_ingestion_rejections enable row level security;
alter table public.grant_ingestion_backups enable row level security;
alter table public.grant_related_table_backups enable row level security;
alter table public.grant_id_mappings enable row level security;

revoke all on public.grant_ingestion_runs from public, anon, authenticated;
revoke all on public.grants_ingestion_staging from public, anon, authenticated;
revoke all on public.grant_ingestion_rejections from public, anon, authenticated;
revoke all on public.grant_ingestion_backups from public, anon, authenticated;
revoke all on public.grant_related_table_backups from public, anon, authenticated;
revoke all on public.grant_id_mappings from public, anon, authenticated;
grant select, insert, update, delete on public.grant_ingestion_runs to service_role;
grant select, insert, update, delete on public.grants_ingestion_staging to service_role;
grant select, insert, update, delete on public.grant_ingestion_rejections to service_role;
grant select, insert, update, delete on public.grant_ingestion_backups to service_role;
grant select, insert, update, delete on public.grant_related_table_backups to service_role;
grant select, insert, update, delete on public.grant_id_mappings to service_role;
grant usage, select on sequence public.grant_ingestion_rejections_id_seq to service_role;

create or replace function public.promote_grant_ingestion(target_run_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_run public.grant_ingestion_runs%rowtype;
  inserted_count integer;
  updated_count integer;
  archived_count integer := 0;
begin
  perform pg_advisory_xact_lock(hashtext('grantclient_grant_ingestion_promotion'));

  select * into target_run
  from public.grant_ingestion_runs
  where id = target_run_id
  for update;

  if not found or target_run.status <> 'staged' or target_run.validation_passed is not true then
    raise exception 'Run % is not a validated staged run', target_run_id;
  end if;

  if not exists (select 1 from public.grants_ingestion_staging where run_id = target_run_id) then
    raise exception 'Run % has no staging records', target_run_id;
  end if;

  insert into public.grant_ingestion_backups (run_id, grant_id, row_data)
  select target_run_id, id, to_jsonb(g)
  from public.grants g
  on conflict (run_id, grant_id) do nothing;

  -- Snapshot every user-linked grant table before changing the catalog. These
  -- tables are never mutated by promotion, but the snapshot provides a complete
  -- recovery and audit point for the exact pre-promotion state.
  insert into public.grant_related_table_backups (run_id, table_name, row_key, row_data)
  select target_run_id, 'saved_grants', id::text, to_jsonb(t) from public.saved_grants t
  union all
  select target_run_id, 'applications', id::text, to_jsonb(t) from public.applications t
  union all
  select target_run_id, 'generated_proposals', id::text, to_jsonb(t) from public.generated_proposals t
  union all
  select target_run_id, 'grant_match_snapshots', id::text, to_jsonb(t) from public.grant_match_snapshots t
  union all
  select target_run_id, 'application_sections', id::text, to_jsonb(t) from public.application_sections t
  union all
  select target_run_id, 'ai_generation_records', id::text, to_jsonb(t) from public.ai_generation_records t
  on conflict (run_id, table_name, row_key) do nothing;

  select count(*) into inserted_count
  from public.grants_ingestion_staging s
  where s.run_id = target_run_id
    and not exists (select 1 from public.grants g where g.id = s.id);

  select count(*) into updated_count
  from public.grants_ingestion_staging s
  where s.run_id = target_run_id
    and exists (select 1 from public.grants g where g.id = s.id);

  insert into public.grants (
    id, title, description, funder, category, region, status, amount, deadline,
    application_url, eligibility_summary, eligible_organization_types,
    required_nonprofit_status, eligible_locations, geographic_scope, focus_areas,
    populations_served, award_min, award_max, rolling_deadline, source_url,
    requirements, required_documents, verified_at, application_open_date,
    deadline_type, official_url, next_review_at, confidence_level, is_active,
    source_title, source_published_at, last_known_deadline,
    last_verification_attempt, verified_by, source, source_record_id,
    source_application_url, funder_type, summary, nonprofit_eligible,
    requires_501c3, fiscal_sponsor_allowed, eligible_states, eligible_counties,
    eligible_countries, target_populations, program_types, estimated_award,
    total_funding_available, currency, letter_of_intent_deadline, recurring,
    frequency, matching_funds_required, contact_name, contact_email,
    contact_phone, verification_status, verification_method, last_checked_at,
    first_seen_at, content_hash, raw_source_data, updated_at
  )
  select
    s.id, s.grant_name, s.description, s.funder_name, s.category, s.region,
    s.status, s.estimated_award, s.deadline, s.source_application_url,
    s.eligibility_summary, s.eligible_organization_types,
    case when s.requires_501c3 then '501c3' else null end,
    s.eligible_states, s.geographic_scope, s.focus_areas, s.target_populations,
    s.minimum_award, s.maximum_award, s.rolling, s.source_url,
    s.application_requirements, s.required_documents, s.verified_at, s.opens_at,
    s.deadline_type, s.source_url, s.last_checked_at + interval '7 days', 'high', true,
    s.source, s.published_at, s.deadline, s.last_checked_at,
    s.verification_method, s.source, s.source_record_id,
    s.source_application_url, s.funder_type, s.summary, s.nonprofit_eligible,
    s.requires_501c3, s.fiscal_sponsor_allowed, s.eligible_states,
    s.eligible_counties, s.eligible_countries, s.target_populations,
    s.program_types, s.estimated_award, s.total_funding_available, s.currency,
    s.letter_of_intent_deadline, s.recurring, s.frequency,
    s.matching_funds_required, s.contact_name, s.contact_email, s.contact_phone,
    s.verification_status, s.verification_method, s.last_checked_at,
    s.first_seen_at, s.content_hash, s.raw_source_data, now()
  from public.grants_ingestion_staging s
  where s.run_id = target_run_id
  on conflict (id) do update set
    title = excluded.title, description = excluded.description, funder = excluded.funder,
    category = excluded.category, region = excluded.region, status = excluded.status,
    amount = excluded.amount, deadline = excluded.deadline,
    application_url = excluded.application_url,
    eligibility_summary = excluded.eligibility_summary,
    eligible_organization_types = excluded.eligible_organization_types,
    required_nonprofit_status = excluded.required_nonprofit_status,
    eligible_locations = excluded.eligible_locations,
    geographic_scope = excluded.geographic_scope, focus_areas = excluded.focus_areas,
    populations_served = excluded.populations_served, award_min = excluded.award_min,
    award_max = excluded.award_max, rolling_deadline = excluded.rolling_deadline,
    source_url = excluded.source_url, requirements = excluded.requirements,
    required_documents = excluded.required_documents, verified_at = excluded.verified_at,
    application_open_date = excluded.application_open_date,
    deadline_type = excluded.deadline_type, official_url = excluded.official_url,
    next_review_at = excluded.next_review_at, confidence_level = excluded.confidence_level,
    is_active = excluded.is_active, source_title = excluded.source_title,
    source_published_at = excluded.source_published_at,
    last_known_deadline = excluded.last_known_deadline,
    last_verification_attempt = excluded.last_verification_attempt,
    verified_by = excluded.verified_by, source = excluded.source,
    source_record_id = excluded.source_record_id,
    source_application_url = excluded.source_application_url,
    funder_type = excluded.funder_type, summary = excluded.summary,
    nonprofit_eligible = excluded.nonprofit_eligible,
    requires_501c3 = excluded.requires_501c3,
    fiscal_sponsor_allowed = excluded.fiscal_sponsor_allowed,
    eligible_states = excluded.eligible_states, eligible_counties = excluded.eligible_counties,
    eligible_countries = excluded.eligible_countries,
    target_populations = excluded.target_populations, program_types = excluded.program_types,
    estimated_award = excluded.estimated_award,
    total_funding_available = excluded.total_funding_available,
    currency = excluded.currency,
    letter_of_intent_deadline = excluded.letter_of_intent_deadline,
    recurring = excluded.recurring, frequency = excluded.frequency,
    matching_funds_required = excluded.matching_funds_required,
    contact_name = excluded.contact_name, contact_email = excluded.contact_email,
    contact_phone = excluded.contact_phone,
    verification_status = excluded.verification_status,
    verification_method = excluded.verification_method,
    last_checked_at = excluded.last_checked_at, first_seen_at = excluded.first_seen_at,
    content_hash = excluded.content_hash, raw_source_data = excluded.raw_source_data,
    updated_at = now();

  if target_run.mode <> 'incremental' then
    update public.grants g
    set status = 'archived', is_active = false,
        closed_reason = 'Not present in approved ingestion run ' || target_run_id::text,
        updated_at = now()
    where not exists (
      select 1 from public.grants_ingestion_staging s
      where s.run_id = target_run_id and s.id = g.id
    );
    get diagnostics archived_count = row_count;
  end if;

  insert into public.grant_id_mappings (run_id, old_grant_id, new_grant_id, mapping_reason)
  select target_run_id, s.id, s.id, 'stable_source_identifier'
  from public.grants_ingestion_staging s
  where s.run_id = target_run_id
  on conflict (run_id, old_grant_id) do nothing;

  update public.grant_ingestion_runs
  set status = 'promoted', promoted_at = now(), records_inserted = inserted_count,
      records_updated = updated_count, records_archived = archived_count,
      after_counts = jsonb_build_object(
        'grants', (select count(*) from public.grants),
        'active_grants', (select count(*) from public.grants where is_active),
        'saved_grants', (select count(*) from public.saved_grants),
        'applications', (select count(*) from public.applications)
      )
  where id = target_run_id;

  return jsonb_build_object(
    'run_id', target_run_id, 'inserted', inserted_count,
    'updated', updated_count, 'archived', archived_count
  );
end;
$$;

create or replace function public.rollback_grant_ingestion(target_run_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  column_updates text;
  restored_count integer;
  archived_new_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('grantclient_grant_ingestion_promotion'));

  if not exists (
    select 1 from public.grant_ingestion_runs
    where id = target_run_id and status = 'promoted'
  ) then
    raise exception 'Run % is not a promoted run', target_run_id;
  end if;
  if not exists (select 1 from public.grant_ingestion_backups where run_id = target_run_id) then
    raise exception 'Run % has no backup', target_run_id;
  end if;

  update public.grants g
  set status = 'archived', is_active = false,
      closed_reason = 'Archived by rollback of run ' || target_run_id::text,
      updated_at = now()
  where not exists (
    select 1 from public.grant_ingestion_backups b
    where b.run_id = target_run_id and b.grant_id = g.id
  );
  get diagnostics archived_new_count = row_count;

  select string_agg(format('%1$I = excluded.%1$I', column_name), ', ' order by ordinal_position)
  into column_updates
  from information_schema.columns
  where table_schema = 'public' and table_name = 'grants' and column_name <> 'id';

  execute format(
    'insert into public.grants select (jsonb_populate_record(null::public.grants, row_data)).* '
    || 'from public.grant_ingestion_backups where run_id = $1 '
    || 'on conflict (id) do update set %s',
    column_updates
  ) using target_run_id;

  select count(*) into restored_count
  from public.grant_ingestion_backups where run_id = target_run_id;

  update public.grant_ingestion_runs
  set status = 'rolled_back', rolled_back_at = now()
  where id = target_run_id;

  return jsonb_build_object(
    'run_id', target_run_id, 'restored', restored_count,
    'new_records_archived', archived_new_count
  );
end;
$$;

revoke all on function public.promote_grant_ingestion(uuid) from public, anon, authenticated;
revoke all on function public.rollback_grant_ingestion(uuid) from public, anon, authenticated;
grant execute on function public.promote_grant_ingestion(uuid) to service_role;
grant execute on function public.rollback_grant_ingestion(uuid) to service_role;
