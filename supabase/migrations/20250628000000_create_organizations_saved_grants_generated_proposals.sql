-- organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_name text not null,
  mission text not null,
  location text,
  budget integer,
  keywords text[],
  is_501c3 boolean default false,
  created_at timestamptz default now()
);

alter table organizations enable row level security;

create policy "organizations_select_own"
  on organizations for select
  using (user_id = auth.uid());

create policy "organizations_insert_own"
  on organizations for insert
  with check (user_id = auth.uid());

create policy "organizations_update_own"
  on organizations for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "organizations_delete_own"
  on organizations for delete
  using (user_id = auth.uid());

-- saved_grants
create table saved_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id text not null,
  status text not null default 'Interested',
  created_at timestamptz default now(),
  constraint saved_grants_status_check check (
    status in ('Interested', 'Researching', 'Drafting', 'Submitted', 'Awarded', 'Rejected')
  )
);

alter table saved_grants enable row level security;

create policy "saved_grants_select_own"
  on saved_grants for select
  using (user_id = auth.uid());

create policy "saved_grants_insert_own"
  on saved_grants for insert
  with check (user_id = auth.uid());

create policy "saved_grants_update_own"
  on saved_grants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saved_grants_delete_own"
  on saved_grants for delete
  using (user_id = auth.uid());

-- generated_proposals
create table generated_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id text not null,
  draft_type text not null,
  proposal text not null,
  created_at timestamptz default now(),
  constraint generated_proposals_draft_type_check check (
    draft_type in ('executive_summary', 'letter_of_intent', 'impact_statement')
  )
);

alter table generated_proposals enable row level security;

create policy "generated_proposals_select_own"
  on generated_proposals for select
  using (user_id = auth.uid());

create policy "generated_proposals_insert_own"
  on generated_proposals for insert
  with check (user_id = auth.uid());

create policy "generated_proposals_update_own"
  on generated_proposals for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "generated_proposals_delete_own"
  on generated_proposals for delete
  using (user_id = auth.uid());
