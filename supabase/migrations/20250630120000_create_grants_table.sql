-- grants catalog (public read)
create table grants (
  id text primary key,
  title text not null,
  description text not null,
  funder text not null,
  category text not null,
  region text not null,
  status text not null default 'open',
  amount integer,
  deadline date,
  application_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grants_status_check check (
    status in ('draft', 'open', 'closed', 'awarded')
  ),
  constraint grants_category_check check (
    category in (
      'Education',
      'Youth Programs',
      'Sports & Recreation',
      'STEM & Technology',
      'Community Development',
      'Arts & Culture',
      'Environment',
      'Healthcare',
      'Food Security',
      'Animal Welfare',
      'Capacity Building'
    )
  ),
  constraint grants_region_check check (
    region in (
      'National',
      'Texas',
      'South Central US',
      'Southwest US',
      'Southeast US',
      'Midwest US',
      'Northeast US',
      'Western US'
    )
  )
);

create index grants_category_idx on grants (category);
create index grants_region_idx on grants (region);
create index grants_status_idx on grants (status);
create index grants_deadline_idx on grants (deadline);

alter table grants enable row level security;

create policy "grants_select_all"
  on grants for select
  using (true);

alter table saved_grants
  add constraint saved_grants_grant_id_fkey
  foreign key (grant_id) references grants (id) on delete cascade;

alter table generated_proposals
  add constraint generated_proposals_grant_id_fkey
  foreign key (grant_id) references grants (id) on delete cascade;
