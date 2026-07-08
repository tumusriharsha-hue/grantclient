-- Account-scoped application tracker records.

alter table saved_grants
  drop constraint if exists saved_grants_grant_id_fkey;

alter table generated_proposals
  drop constraint if exists generated_proposals_grant_id_fkey;

create unique index if not exists saved_grants_user_grant_unique
  on saved_grants (user_id, grant_id);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id text,
  grant_title text,
  grant_funder text,
  grant_category text,
  application_url text,
  title text not null,
  status text not null default 'drafting',
  draft_content jsonb not null default '[]'::jsonb,
  progress integer not null default 0,
  amount text,
  status_note text,
  last_updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  decision_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check check (
    status in ('drafting', 'submitted', 'approved', 'rejected')
  ),
  constraint applications_progress_check check (
    progress >= 0 and progress <= 100
  )
);

create index if not exists applications_user_id_idx
  on applications (user_id);

create index if not exists applications_user_status_idx
  on applications (user_id, status);

create index if not exists applications_user_grant_id_idx
  on applications (user_id, grant_id);

alter table applications enable row level security;

create policy "applications_select_own"
  on applications for select
  using (user_id = auth.uid());

create policy "applications_insert_own"
  on applications for insert
  with check (user_id = auth.uid());

create policy "applications_update_own"
  on applications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "applications_delete_own"
  on applications for delete
  using (user_id = auth.uid());

create or replace function set_applications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;

create trigger applications_set_updated_at
  before update on applications
  for each row
  execute function set_applications_updated_at();
