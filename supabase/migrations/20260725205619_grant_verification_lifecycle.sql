-- Grant verification lifecycle metadata.
-- This migration preserves grant IDs and relationships. It intentionally does
-- not assert that existing catalog data is current; unverified rows are made
-- inactive until a reviewer records a current first-party source.

alter table public.grants
  drop constraint if exists grants_status_check;

alter table public.grants
  add column if not exists is_active boolean not null default true,
  add column if not exists guidelines_url text,
  add column if not exists funder_url text,
  add column if not exists secondary_source_url text,
  add column if not exists source_title text,
  add column if not exists source_published_at timestamptz,
  add column if not exists previous_deadline date,
  add column if not exists last_known_deadline date,
  add column if not exists current_cycle text,
  add column if not exists closed_reason text,
  add column if not exists last_verification_attempt timestamptz,
  add column if not exists verified_by text;

update public.grants
set status = case status
  when 'invitation_only' then 'invite_only'
  when 'no_unsolicited_applications' then 'invite_only'
  when 'recurring_unconfirmed' then 'awaiting_next_cycle'
  when 'expired' then 'closed'
  when 'archived' then 'unverified'
  else status
end;

update public.grants
set is_active = false
where verified_at is null
   or status in ('closed', 'discontinued', 'invite_only', 'awaiting_next_cycle', 'unverified');

alter table public.grants
  add constraint grants_status_check check (status in (
    'draft',
    'open',
    'upcoming',
    'rolling',
    'awaiting_next_cycle',
    'closed',
    'discontinued',
    'invite_only',
    'unverified',
    'awarded',
    'paused'
  )),
  add constraint grants_verification_dates_check check (
    (previous_deadline is null or last_known_deadline is null or previous_deadline <= last_known_deadline)
  );

create index if not exists grants_active_status_deadline_idx
  on public.grants (is_active, status, deadline);

create index if not exists grants_verification_queue_idx
  on public.grants (is_active, last_verification_attempt, next_review_at);
