# Supabase Setup

Create one Supabase project for the production website MVP.

## Required Pieces

- Postgres database for website state.
- Auth for admin/reviewer/publisher roles.
- Storage bucket named `research-artifacts`.
- Service role key stored only in Vercel server-side environment variables.

## Apply Schema

From the repo root, after installing the Supabase CLI and linking your project:

```bash
supabase db push
```

Migration:

- `supabase/migrations/202607130001_website_foundation.sql`

## Storage Bucket

Create a private bucket:

```text
research-artifacts
```

Suggested object paths:

```text
research-artifacts/{artifact_id}/artifact.json
research-artifacts/{artifact_id}/series/normalized_equity.json
research-artifacts/{artifact_id}/series/drawdown.json
research-artifacts/{artifact_id}/charts/equity.png
research-artifacts/{artifact_id}/review/approval.json
```

## Security Notes

- Public website pages should read only `published` artifacts.
- Admin mutation paths should use server-side checks and audit logs.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
