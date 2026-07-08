alter table organizations
  add column if not exists profile_picture_url text;

insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do update set public = excluded.public;

create policy "profile_pictures_select_all"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

create policy "profile_pictures_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_pictures_update_own"
  on storage.objects for update
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_pictures_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
