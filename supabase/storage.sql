-- PokéQA Lab - Storage (bucket público de demonstração)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pokeqa-uploads', 'pokeqa-uploads', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pokeqa_uploads_read" on storage.objects;
drop policy if exists "pokeqa_uploads_insert" on storage.objects;
drop policy if exists "pokeqa_uploads_delete" on storage.objects;
create policy "pokeqa_uploads_read" on storage.objects for select to anon, authenticated using (bucket_id = 'pokeqa-uploads');
create policy "pokeqa_uploads_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'pokeqa-uploads' and (storage.foldername(name))[1] = 'demo');
create policy "pokeqa_uploads_delete" on storage.objects for delete to anon, authenticated
  using (bucket_id = 'pokeqa-uploads' and (storage.foldername(name))[1] = 'demo');
