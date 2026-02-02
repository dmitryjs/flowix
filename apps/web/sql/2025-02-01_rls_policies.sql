alter table public.flows enable row level security;
alter table public.screens enable row level security;
alter table public.steps enable row level security;
alter table public.assets enable row level security;

drop policy if exists flows_select on public.flows;
drop policy if exists flows_insert on public.flows;
drop policy if exists flows_update on public.flows;
drop policy if exists flows_delete on public.flows;

create policy flows_select on public.flows
  for select using (user_id = auth.uid());
create policy flows_insert on public.flows
  for insert with check (user_id = auth.uid());
create policy flows_update on public.flows
  for update using (user_id = auth.uid());
create policy flows_delete on public.flows
  for delete using (user_id = auth.uid());

drop policy if exists screens_select on public.screens;
drop policy if exists screens_insert on public.screens;
drop policy if exists screens_update on public.screens;
drop policy if exists screens_delete on public.screens;

create policy screens_select on public.screens
  for select using (
    exists (select 1 from public.flows f where f.id = screens.flow_id and f.user_id = auth.uid())
  );
create policy screens_insert on public.screens
  for insert with check (
    exists (select 1 from public.flows f where f.id = screens.flow_id and f.user_id = auth.uid())
  );
create policy screens_update on public.screens
  for update using (
    exists (select 1 from public.flows f where f.id = screens.flow_id and f.user_id = auth.uid())
  );
create policy screens_delete on public.screens
  for delete using (
    exists (select 1 from public.flows f where f.id = screens.flow_id and f.user_id = auth.uid())
  );

drop policy if exists steps_select on public.steps;
drop policy if exists steps_insert on public.steps;
drop policy if exists steps_update on public.steps;
drop policy if exists steps_delete on public.steps;

create policy steps_select on public.steps
  for select using (
    exists (select 1 from public.flows f where f.id = steps.flow_id and f.user_id = auth.uid())
  );
create policy steps_insert on public.steps
  for insert with check (
    exists (select 1 from public.flows f where f.id = steps.flow_id and f.user_id = auth.uid())
  );
create policy steps_update on public.steps
  for update using (
    exists (select 1 from public.flows f where f.id = steps.flow_id and f.user_id = auth.uid())
  );
create policy steps_delete on public.steps
  for delete using (
    exists (select 1 from public.flows f where f.id = steps.flow_id and f.user_id = auth.uid())
  );

drop policy if exists assets_select on public.assets;
drop policy if exists assets_insert on public.assets;
drop policy if exists assets_update on public.assets;
drop policy if exists assets_delete on public.assets;

create policy assets_select on public.assets
  for select using (user_id = auth.uid());
create policy assets_insert on public.assets
  for insert with check (user_id = auth.uid());
create policy assets_update on public.assets
  for update using (user_id = auth.uid());
create policy assets_delete on public.assets
  for delete using (user_id = auth.uid());
