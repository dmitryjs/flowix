This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started (Flowix)

### Node.js
Install Node 20.9+:
```bash
nvm install 20.9.0
nvm use 20.9.0
node -v
```

### Supabase CLI (local)
Install:
```bash
brew install supabase/tap/supabase
supabase --version
```

### Docker Desktop (required for local Supabase)
```bash
docker info
```
If Docker Desktop is not running, `supabase start` will fail.

Start local Supabase:
```bash
supabase start
```

Stop local Supabase:
```bash
supabase stop
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

### Dev server
```bash
pnpm dev:local
```

Open http://localhost:3000
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
