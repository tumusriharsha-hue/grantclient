-- Anonymous sign-in is no longer part of the application surface. Keep the
-- organization table protected if an old anonymous session still exists.
drop policy if exists "organizations_require_full_account" on public.organizations;

create policy "organizations_require_full_account"
  on public.organizations as restrictive
  for all
  to authenticated
  using (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
