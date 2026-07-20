-- Reuse the existing onboarding fields as the canonical matching inputs.
-- Existing organizations remain nullable/incomplete; no values are inferred.
alter table public.organizations
  add column if not exists populations_served text[] default '{}',
  add column if not exists requested_funding_min bigint,
  add column if not exists requested_funding_max bigint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'organizations_requested_funding_nonnegative_check'
  ) then
    alter table public.organizations add constraint organizations_requested_funding_nonnegative_check
      check (coalesce(requested_funding_min, 0) >= 0 and coalesce(requested_funding_max, 0) >= 0);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'organizations_requested_funding_order_check'
  ) then
    alter table public.organizations add constraint organizations_requested_funding_order_check
      check (requested_funding_min is null or requested_funding_max is null or requested_funding_max >= requested_funding_min);
  end if;
end $$;
