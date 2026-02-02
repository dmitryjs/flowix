## Smoke Check Results

Date/Time: 2026-02-02T07:15:25Z
Environment: local

### Steps
1) Start Supabase locally — **OK**
   - Result: `supabase start` running
2) Start web (`pnpm -C apps/web dev:local`) — **OK**
   - Result: Next dev ready at http://localhost:3000
3) Open /auth and login via magic link — **FAIL**
   - Reason: manual browser + email action not available in this session
4) Record short flow in extension (2 clicks + 1 snapshot) — **FAIL**
   - Reason: depends on manual browser + extension interaction
5) Click Sync — **FAIL**
   - Reason: depends on manual browser + extension interaction
6) Open / and verify flow appears — **FAIL**
   - Reason: depends on sync step
7) Open /flows/[id] and verify screens/steps — **FAIL**
   - Reason: depends on sync step
8) Verify screenshots load (signed URLs) — **FAIL**
   - Reason: depends on sync step
9) Reload page / open incognito after login — **FAIL**
   - Reason: depends on auth/session

### Notes
- No code changes were made during this attempt.
