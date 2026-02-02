-- Bucket: screenshots (private)
-- Path format: flows/{userId}/{flowId}/{screenId}.png

alter table storage.objects enable row level security;

drop policy if exists screenshots_select on storage.objects;
drop policy if exists screenshots_insert on storage.objects;
drop policy if exists screenshots_update on storage.objects;
drop policy if exists screenshots_delete on storage.objects;

create policy screenshots_select on storage.objects
  for select using (
    bucket_id = 'screenshots'
    and split_part(name, '/', 1) = 'flows'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy screenshots_insert on storage.objects
  for insert with check (
    bucket_id = 'screenshots'
    and split_part(name, '/', 1) = 'flows'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy screenshots_update on storage.objects
  for update using (
    bucket_id = 'screenshots'
    and split_part(name, '/', 1) = 'flows'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy screenshots_delete on storage.objects
  for delete using (
    bucket_id = 'screenshots'
    and split_part(name, '/', 1) = 'flows'
    and split_part(name, '/', 2) = auth.uid()::text
  );
