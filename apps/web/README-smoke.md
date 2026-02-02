# Flowix Smoke Check (C2)

## Prerequisites
### Node.js
```bash
nvm install 20.9.0
nvm use 20.9.0
node -v
```

### Docker Desktop (required for local Supabase)
```bash
docker info
```
If Docker Desktop is not running, `supabase start` will fail.

### Supabase CLI
```bash
brew install supabase/tap/supabase
supabase --version
```

### Local Supabase
```bash
supabase start
```

### Env
```bash
cp .env.example .env.local
```

Set:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Port 3000 (required)
```bash
lsof -i :3000
```
If a process is running:
```bash
kill <pid>
```
If a dev lock remains:
```bash
rm -rf .next/dev
```

### Web
```bash
pnpm -C apps/web dev:local
```

## Manual
1) Open `/auth` and login with magic link.
2) Open extension popup, start recording, make a few clicks, take snapshot.
3) Click **Sync** in extension.
4) Open `/` and confirm the flow appears.
5) Open `/flows/[id]` and confirm screens/steps render.
6) Confirm screenshots load (signed URLs).

## Minimal API check (manual)
### 401 without session
```
curl -i -X POST http://localhost:3000/api/sync/flow \
  -H "Content-Type: application/json" \
  -d '{"flow":{"id":"test","createdAt":0,"steps":[]}}'
```
Expected: `401 Unauthorized`.
