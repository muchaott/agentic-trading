# Strategy Ledger Web App

Production web app skeleton for the ETF strategy research product.

The static prototype remains in `website/`. This app is the production migration
target: Next.js routes, Supabase-backed persistence, artifact ingestion, and
vendor integrations.

The app currently uses a copied prototype artifact fixture under `apps/web/data`
so Vercel can build from the `apps/web` root. Production ingestion should replace
this with Supabase metadata plus immutable objects from the `research-artifacts`
storage bucket.

## Local Setup

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

See `.env.example`.

Do not commit real keys. Add production values in Vercel project settings.

## Deployment

Recommended Vercel settings:

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Database

Apply the Supabase migration from the repo root:

```bash
supabase db push
```

The first migration is:

- `supabase/migrations/202607130001_website_foundation.sql`
