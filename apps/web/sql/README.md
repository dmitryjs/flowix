# Supabase SQL order

Apply in order:

1) **Tables / schema**
   - Use your existing schema migration for `flows`, `screens`, `steps`, `assets`.
   - If not applied, create tables first (see initial schema used in C2).

2) **sync_flow_atomic**
   - `2025-02-01_sync_flow_atomic.sql`
   - Defines RPC for transactional sync.

3) **screens.asset_id**
   - `2025-02-01_add_screens_asset_id.sql`
   - Adds FK from screens to assets.

4) **RLS policies**
   - `2025-02-01_rls_policies.sql`
   - Enables RLS and per-user policies for flows/screens/steps/assets.

5) **Storage policies**
   - `2025-02-01_storage_policies.sql`
   - Restricts storage.objects to `screenshots` bucket and `flows/{userId}/...` path.
