alter table public.screens
  add column if not exists asset_id uuid null;

alter table public.screens
  add constraint screens_asset_id_fkey
  foreign key (asset_id) references public.assets (id)
  on delete set null;

create index if not exists idx_screens_asset_id on public.screens (asset_id);

-- TODO(C2): screenshot_url left for compatibility; remove after C2.
