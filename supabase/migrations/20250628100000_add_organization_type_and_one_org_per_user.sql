alter table organizations
  add column organization_type text,
  alter column location set not null;

update organizations
set organization_type = 'Other'
where organization_type is null;

alter table organizations
  alter column organization_type set not null,
  add constraint organizations_organization_type_check check (
    organization_type in (
      '501(c)(3)',
      'School Organization',
      'Student Club',
      'Community Group',
      'Faith-Based Organization',
      'Fiscal Sponsor',
      'Other'
    )
  ),
  add constraint organizations_user_id_unique unique (user_id);
