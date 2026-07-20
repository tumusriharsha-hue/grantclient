-- Anonymous Supabase users are still scoped to their own auth.uid().
-- They may save only the onboarding organization row needed for testing.
-- Guest access to applications, saved grants, documents, and AI remains blocked
-- by application authorization checks and their existing RLS policies.

drop policy if exists "organizations_require_full_account" on public.organizations;

drop policy if exists "organizations_select_own" on public.organizations;
create policy "organizations_select_own"
  on public.organizations for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "organizations_insert_own" on public.organizations;
create policy "organizations_insert_own"
  on public.organizations for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "organizations_update_own" on public.organizations;
create policy "organizations_update_own"
  on public.organizations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "organizations_delete_own" on public.organizations;
create policy "organizations_delete_own"
  on public.organizations for delete to authenticated
  using ((select auth.uid()) = user_id);
