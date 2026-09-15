insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Vehicle images are publicly readable"
on storage.objects for select
using (bucket_id = 'vehicle-images');

create policy "Users can upload vehicle images to their folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'vehicle-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update vehicle images in their folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'vehicle-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'vehicle-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete vehicle images in their folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'vehicle-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
