-- Onboarding fields and updated organization types for grant matching

alter table organizations
  add column if not exists mission_categories text[] default '{}',
  add column if not exists populations_served text[] default '{}',
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists annual_budget_range text,
  add column if not exists organization_age_range text,
  add column if not exists preferred_grant_amount text,
  add column if not exists preferred_grant_types text[] default '{}',
  add column if not exists accept_government_grants boolean default true,
  add column if not exists has_501c3 boolean default false,
  add column if not exists onboarding_step integer default 1,
  add column if not exists onboarding_completed boolean default false;

alter table organizations
  alter column mission drop not null,
  alter column location drop not null;

update organizations
set
  has_501c3 = coalesce(is_501c3, false),
  mission_categories = case
    when coalesce(array_length(mission_categories, 1), 0) > 0 then mission_categories
    when keywords is not null then keywords
    else '{}'
  end,
  onboarding_completed = true,
  onboarding_step = 6
where organization_name is not null
  and (location is not null or state is not null);

alter table organizations
  drop constraint if exists organizations_organization_type_check;

alter table organizations
  add constraint organizations_organization_type_check check (
    organization_type in (
      '501(c)(3) Nonprofit',
      'School',
      'University',
      'Religious Organization',
      'Community Group',
      'Social Enterprise',
      'Other',
      '501(c)(3)',
      'School Organization',
      'Student Club',
      'Community Group',
      'Faith-Based Organization',
      'Fiscal Sponsor',
      'Other'
    )
  );
