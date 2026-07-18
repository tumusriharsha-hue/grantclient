-- Structured matching, application setup, and section-level drafting.
-- All additions are nullable or have conservative defaults; no production rows are rewritten.

alter table public.organizations
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists nonprofit_status text,
  add column if not exists country text default 'US',
  add column if not exists geographic_service_area text[],
  add column if not exists programs text[],
  add column if not exists impact_goals text,
  add column if not exists funding_needs text,
  add column if not exists requested_funding_min bigint,
  add column if not exists requested_funding_max bigint,
  add column if not exists previous_grant_experience text,
  add column if not exists website text,
  add column if not exists year_founded integer,
  add column if not exists employee_count integer,
  add column if not exists volunteer_count integer;

alter table public.organizations
  add constraint organizations_nonprofit_status_check check (
    nonprofit_status is null or nonprofit_status in ('501c3', 'nonprofit', 'fiscal_sponsor', 'none')
  ),
  add constraint organizations_requested_funding_check check (
    coalesce(requested_funding_min, 0) >= 0
    and coalesce(requested_funding_max, requested_funding_min, 0) >= coalesce(requested_funding_min, 0)
  );

alter table public.grants
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
  add column if not exists verified_at timestamptz;

alter table public.grants
  add constraint grants_amount_ranges_check check (
    coalesce(award_min, 0) >= 0
    and coalesce(award_max, award_min, 0) >= coalesce(award_min, 0)
    and coalesce(minimum_request_amount, 0) >= 0
    and coalesce(maximum_request_amount, minimum_request_amount, 0) >= coalesce(minimum_request_amount, 0)
    and coalesce(minimum_annual_budget, 0) >= 0
    and coalesce(maximum_annual_budget, minimum_annual_budget, 0) >= coalesce(minimum_annual_budget, 0)
  ),
  add constraint grants_application_questions_array_check check (
    application_questions is null or jsonb_typeof(application_questions) = 'array'
  );

alter table public.applications
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists grant_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists setup_data jsonb not null default '{}'::jsonb,
  add column if not exists amount_requested bigint;

alter table public.applications
  add constraint applications_amount_requested_check check (
    amount_requested is null or amount_requested > 0
  );

create unique index if not exists applications_user_grant_unique
  on public.applications (user_id, grant_id)
  where grant_id is not null;

create index if not exists grants_upcoming_idx
  on public.grants (status, rolling_deadline, deadline);

create index if not exists generated_proposals_user_id_idx
  on public.generated_proposals (user_id);

alter function public.set_applications_updated_at() set search_path = '';

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

drop policy if exists "profile_pictures_select_all" on storage.objects;

alter policy "organizations_select_own" on public.organizations
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "organizations_insert_own" on public.organizations
  to authenticated
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "organizations_update_own" on public.organizations
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "organizations_delete_own" on public.organizations
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

alter policy "saved_grants_select_own" on public.saved_grants
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "saved_grants_insert_own" on public.saved_grants
  to authenticated
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "saved_grants_update_own" on public.saved_grants
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "saved_grants_delete_own" on public.saved_grants
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

alter policy "generated_proposals_select_own" on public.generated_proposals
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "generated_proposals_insert_own" on public.generated_proposals
  to authenticated
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "generated_proposals_update_own" on public.generated_proposals
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "generated_proposals_delete_own" on public.generated_proposals
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

alter policy "applications_select_own" on public.applications
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "applications_insert_own" on public.applications
  to authenticated
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "applications_update_own" on public.applications
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
alter policy "applications_delete_own" on public.applications
  to authenticated
  using ((select auth.uid()) = user_id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

alter policy "grants_select_all" on public.grants
  to anon, authenticated
  using (true);

alter policy "profile_pictures_insert_own" on storage.objects
  to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
alter policy "profile_pictures_update_own" on storage.objects
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    bucket_id = 'profile-pictures'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
alter policy "profile_pictures_delete_own" on storage.objects
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

create table if not exists public.organization_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now()
);

create index if not exists organization_documents_owner_idx
  on public.organization_documents (user_id, organization_id);

insert into storage.buckets (id, name, public)
values ('organization-documents', 'organization-documents', false)
on conflict (id) do update set public = excluded.public;

create policy "organization_document_objects_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'organization-documents'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

create policy "organization_document_objects_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'organization-documents'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

create policy "organization_document_objects_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'organization-documents'
    and (select auth.uid())::text = (storage.foldername(name))[1]
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

create table if not exists public.grant_match_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  grant_id text not null,
  score integer not null check (score between 0 and 100),
  score_breakdown jsonb not null,
  score_version text not null,
  eligibility_status text not null check (
    eligibility_status in ('eligible', 'likely_eligible', 'needs_verification', 'ineligible')
  ),
  verification_items text[] not null default '{}',
  explanation jsonb,
  prompt_version text,
  model text,
  cache_key text not null unique,
  organization_updated_at timestamptz,
  grant_updated_at timestamptz,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists grant_match_snapshots_lookup_idx
  on public.grant_match_snapshots (user_id, organization_id, score desc);

create table if not exists public.application_sections (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section_key text not null,
  title text not null,
  content text not null default '',
  missing_information jsonb not null default '[]'::jsonb,
  used_source_fields jsonb not null default '[]'::jsonb,
  status text not null default 'not_started' check (
    status in ('not_started', 'draft', 'complete', 'stale')
  ),
  template_version text not null,
  prompt_version text,
  model text,
  previous_content text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, section_key)
);

create index if not exists application_sections_owner_idx
  on public.application_sections (user_id, application_id);

create table if not exists public.ai_generation_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  grant_id text,
  generation_kind text not null check (
    generation_kind in ('match_explanation', 'proposal_section')
  ),
  cache_key text not null unique,
  request_hash text not null,
  response jsonb,
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'failed')
  ),
  prompt_version text not null,
  model text not null,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_generation_records_owner_idx
  on public.ai_generation_records (user_id, generation_kind, created_at desc);

alter table public.organization_documents enable row level security;
alter table public.grant_match_snapshots enable row level security;
alter table public.application_sections enable row level security;
alter table public.ai_generation_records enable row level security;

create policy "organizations_require_full_account"
  on public.organizations as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "saved_grants_require_full_account"
  on public.saved_grants as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "generated_proposals_require_full_account"
  on public.generated_proposals as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "applications_require_full_account"
  on public.applications as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "organization_documents_require_full_account"
  on public.organization_documents as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "grant_match_snapshots_require_full_account"
  on public.grant_match_snapshots as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "application_sections_require_full_account"
  on public.application_sections as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "ai_generation_records_require_full_account"
  on public.ai_generation_records as restrictive for all to authenticated
  using (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
  with check (coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);

create policy "organization_documents_select_own"
  on public.organization_documents for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "organization_documents_insert_own"
  on public.organization_documents for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    )
  );
create policy "organization_documents_delete_own"
  on public.organization_documents for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "grant_match_snapshots_select_own"
  on public.grant_match_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "grant_match_snapshots_insert_own"
  on public.grant_match_snapshots for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "grant_match_snapshots_update_own"
  on public.grant_match_snapshots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "grant_match_snapshots_delete_own"
  on public.grant_match_snapshots for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "application_sections_select_own"
  on public.application_sections for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "application_sections_insert_own"
  on public.application_sections for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.applications
      where applications.id = application_id
        and applications.user_id = (select auth.uid())
    )
  );
create policy "application_sections_update_own"
  on public.application_sections for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "application_sections_delete_own"
  on public.application_sections for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "ai_generation_records_select_own"
  on public.ai_generation_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "ai_generation_records_insert_own"
  on public.ai_generation_records for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "ai_generation_records_update_own"
  on public.ai_generation_records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "applications_reference_own_organization"
  on public.applications as restrictive for all to authenticated
  using (
    organization_id is null or exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    )
  )
  with check (
    organization_id is null or exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    )
  );

create policy "grant_match_snapshots_reference_own_organization"
  on public.grant_match_snapshots as restrictive for all to authenticated
  using (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    )
  );

create policy "application_sections_reference_own_application"
  on public.application_sections as restrictive for all to authenticated
  using (
    exists (
      select 1 from public.applications
      where applications.id = application_id
        and applications.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.applications
      where applications.id = application_id
        and applications.user_id = (select auth.uid())
    )
  );

create policy "ai_generation_records_reference_owned_rows"
  on public.ai_generation_records as restrictive for all to authenticated
  using (
    (organization_id is null or exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    ))
    and (application_id is null or exists (
      select 1 from public.applications
      where applications.id = application_id
        and applications.user_id = (select auth.uid())
    ))
  )
  with check (
    (organization_id is null or exists (
      select 1 from public.organizations
      where organizations.id = organization_id
        and organizations.user_id = (select auth.uid())
    ))
    and (application_id is null or exists (
      select 1 from public.applications
      where applications.id = application_id
        and applications.user_id = (select auth.uid())
    ))
  );

grant select on public.grants to anon, authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.saved_grants to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, delete on public.organization_documents to authenticated;
grant select, insert, update, delete on public.grant_match_snapshots to authenticated;
grant select, insert, update, delete on public.application_sections to authenticated;
grant select, insert, update on public.ai_generation_records to authenticated;

create or replace function public.set_matching_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_matching_updated_at() from public, anon, authenticated;
revoke execute on function public.set_applications_updated_at() from public, anon, authenticated;

drop trigger if exists organizations_set_matching_updated_at on public.organizations;
create trigger organizations_set_matching_updated_at
  before update on public.organizations
  for each row execute function public.set_matching_updated_at();

drop trigger if exists grants_set_matching_updated_at on public.grants;
create trigger grants_set_matching_updated_at
  before update on public.grants
  for each row execute function public.set_matching_updated_at();

drop trigger if exists grant_match_snapshots_set_updated_at on public.grant_match_snapshots;
create trigger grant_match_snapshots_set_updated_at
  before update on public.grant_match_snapshots
  for each row execute function public.set_matching_updated_at();

drop trigger if exists application_sections_set_updated_at on public.application_sections;
create trigger application_sections_set_updated_at
  before update on public.application_sections
  for each row execute function public.set_matching_updated_at();
