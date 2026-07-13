# Vendor Action Items

Status: Setup checklist  
Date: 2026-07-13

## MVP Vendor Decisions

| Need | Default Vendor | Owner | Status |
| --- | --- | --- | --- |
| Source control | GitHub | Founder | In use |
| Web hosting | Vercel | Founder | Create project |
| Database/auth/storage | Supabase | Founder | Create project |
| Historical EOD prices | Tiingo | Founder | Open account and confirm license |
| ETF metadata/holdings | EODHD | Founder | Open account and confirm coverage/license |
| Charts | TradingView Lightweight Charts | Engineering | Added as app dependency |
| Email | Resend | Founder | Create account and verify domain |
| Analytics | Plausible | Founder | Create account after domain chosen |
| Error monitoring | Sentry | Founder | Create project |
| Payments | Stripe | Founder | Deferred |

## Founder Tasks

1. Create a Vercel account and connect `muchaott/agentic-trading`.
2. Set the Vercel project root directory to `apps/web`.
3. Create a Supabase project in a US region.
4. Create a private Supabase Storage bucket named `research-artifacts`.
5. Create a Resend account and verify the sending domain.
6. Create a Sentry project for a Next.js app.
7. Create a Plausible site after the production domain is selected.
8. Open Tiingo account and ask for written confirmation of:
   - commercial backtesting rights,
   - internal caching rights,
   - derived metric display rights,
   - public chart display rights,
   - paid research rights later.
9. Open EODHD account and ask for written confirmation of:
   - ETF metadata coverage,
   - ETF holdings coverage,
   - holdings count availability,
   - commercial display rights,
   - derived metric display rights.
10. Talk to regulatory counsel before paid plans, live signals, personalized
    recommendations, or broker integrations.

## Environment Variables To Add In Vercel

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_RESEARCH_ARTIFACT_BUCKET
TIINGO_API_TOKEN
EODHD_API_TOKEN
RESEND_API_KEY
RESEND_FROM_EMAIL
WAITLIST_NOTIFY_EMAIL
NEXT_PUBLIC_PLAUSIBLE_DOMAIN
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

Do not put real secrets in GitHub or chat.

## Deferred

- Stripe checkout and billing.
- Real-time or intraday market data.
- Broker integrations.
- Live signal delivery.
- User accounts for subscribers.
