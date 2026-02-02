create or replace function public.sync_flow_atomic(
  p_user_id uuid,
  p_flow_id uuid,
  p_title text,
  p_created_at timestamptz,
  p_updated_at timestamptz,
  p_screens jsonb,
  p_steps jsonb,
  p_assets jsonb
) returns uuid
language plpgsql
as $$
begin
  insert into public.flows (id, user_id, title, created_at, updated_at)
  values (p_flow_id, p_user_id, coalesce(p_title, 'Untitled'), p_created_at, p_updated_at)
  on conflict (id) do update
    set title = excluded.title,
        updated_at = excluded.updated_at
    where public.flows.user_id = p_user_id;

  if not exists (
    select 1 from public.flows where id = p_flow_id and user_id = p_user_id
  ) then
    raise exception 'Flow not found for user';
  end if;

  delete from public.assets where flow_id = p_flow_id;
  delete from public.steps where flow_id = p_flow_id;
  delete from public.screens where flow_id = p_flow_id;

  insert into public.screens (id, flow_id, url, title, created_at)
  select
    (s->>'id')::uuid,
    p_flow_id,
    s->>'url',
    nullif(s->>'title',''),
    (s->>'created_at')::timestamptz
  from jsonb_array_elements(coalesce(p_screens, '[]'::jsonb)) as s;

  insert into public.steps (id, flow_id, screen_id, ts, type, url, target, screenshot_url, created_at)
  select
    (st->>'id')::uuid,
    p_flow_id,
    (st->>'screen_id')::uuid,
    (st->>'ts')::bigint,
    st->>'type',
    st->>'url',
    st->'target',
    null,
    (st->>'created_at')::timestamptz
  from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) as st;

  insert into public.assets (id, user_id, flow_id, screen_id, path, created_at)
  select
    (a->>'id')::uuid,
    p_user_id,
    p_flow_id,
    (a->>'screen_id')::uuid,
    a->>'path',
    (a->>'created_at')::timestamptz
  from jsonb_array_elements(coalesce(p_assets, '[]'::jsonb)) as a;

  update public.screens s
  set asset_id = a.id
  from public.assets a
  where s.flow_id = p_flow_id
    and a.flow_id = p_flow_id
    and s.id = a.screen_id;

  return p_flow_id;
end;
$$;

alter function public.sync_flow_atomic(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  jsonb,
  jsonb,
  jsonb
) security invoker;
