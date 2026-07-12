# Website Technical Foundation

Status: Draft for production MVP planning  
Date: 2026-07-12  
Scope: Website product foundation only

## Executive Decision

Build the production MVP as a read-only ETF research publication product.

The website must consume approved, immutable research artifacts. It must not create
strategies, tune parameters, run arbitrary backtests, expose current trade
instructions, or sell live signal access in MVP.

Technical boundary:

```text
Python research/backtest pipeline
  -> versioned research artifact
  -> quant + compliance review gate
  -> website API/frontend
  -> public research pages and waitlist
```

## Vendor Stack Recommendation

### Recommended MVP Defaults

| Capability | Recommendation | Why |
| --- | --- | --- |
| Public web app | Next.js App Router + TypeScript | Route-based public pages, server rendering/static generation, API route support, strong ecosystem. |
| Hosting/CDN | Vercel for standard Next.js, or Cloudflare Pages/Workers if edge-first and Sites deployment is required | Both support modern web app delivery. Choose one, not both, for production. |
| Database | Supabase Postgres | Postgres is the right audit-friendly system of record; Supabase bundles Postgres, Auth, Storage, and Edge Functions. |
| Object storage | Supabase Storage or Cloudflare R2 | Store immutable JSON/CSV artifacts, chart snapshots, disclosure PDFs, and source snapshots. |
| Auth/admin | Supabase Auth for stack simplicity; Clerk if faster polished admin auth is preferred | Need role-based admin, quant reviewer, compliance reviewer, publisher, read-only. |
| Email/waitlist | Resend or Postmark | Transactional confirmation and waitlist emails. Use DB as source of truth. |
| Charts | Highcharts Stock if accessibility/commercial support matters most; TradingView Lightweight Charts if financial UX and low bundle size matter most; Chart.js only for simpler non-financial charts | MVP needs equity curves, drawdowns, benchmark comparison, accessible summaries, and exportable artifacts. |
| Product analytics | Plausible for privacy-light web analytics; PostHog if funnels, feature flags, replay, and experiments are needed | Track trust funnel without over-collecting user data. |
| Error monitoring | Sentry | Mature Next.js support for client/server/edge error capture. |
| Payments | Stripe, deferred | Do not integrate checkout until legal/compliance clears paid research or signals. |

### Data Vendor Recommendation

Use two tiers:

1. MVP data vendor for adjusted historical ETF/benchmark OHLCV and corporate actions.
2. Later enterprise/vendor-review path for ETF holdings, AUM, fees, classifications, and redistribution rights.

Shortlist:

| Need | Candidate | Notes |
| --- | --- | --- |
| Adjusted historical EOD prices | Tiingo | Documentation explicitly covers adjusted open/high/low/close, dividends, splits, and EOD correction timing. Must confirm commercial display/derived-data rights. |
| Historical/intraday OHLCV and broader market data | Massive/Polygon | Aggregates endpoint supports custom OHLC bars and plan tiers by recency/history. Good if later delayed or real-time data is needed. Must confirm redistribution rights. |
| ETF/fundamentals/metadata/holdings | EODHD or Intrinio | EODHD documents fundamentals for stocks, ETFs, mutual funds, and indices plus broad ETF coverage. Intrinio is worth evaluating for institutional ETF holdings/licensing. |
| Benchmarks | Same provider as price data | Avoid cross-vendor reconciliation unless needed. |
| Public fund documents | Issuer files, used only if license allows | Use as source-of-truth references, not scraped production dependency unless rights are reviewed. |

Do not rely on Yahoo Finance for production. It is acceptable for local research prototypes only.

## Architecture

### Runtime Surfaces

Public:

- `/`
- `/research`
- `/research/:strategySlug/:ticker`
- `/methodology`
- `/data-sources`
- `/risk-disclosures`
- `/waitlist`

Private:

- `/admin/research`
- `/admin/research/:id/review`
- `/admin/artifacts`
- `/admin/disclosures`

Offline:

- Research artifact export job
- Vendor data import job
- Artifact schema validation job
- Stale-data monitor

### System Of Record

Postgres should store:

- Instruments
- Strategy families
- Strategy variants
- Strategy rule versions
- Data source snapshots
- Backtest runs
- Metric snapshots
- Research reports
- Disclosure versions
- Content reviews
- Waitlist interest
- Audit log events

Object storage should store:

- Immutable research artifact JSON
- Equity/drawdown/monthly/yearly series
- Vendor input snapshots when licensing permits
- Generated chart images
- Disclosure documents
- Review attachments

### Publication Workflow

Research artifacts move through:

1. Draft
2. Quant reviewed
3. Compliance reviewed
4. Published
5. Retired or archived

Publish requirements:

- Strategy rule version exists.
- Backtest engine version exists.
- Data source snapshot exists.
- Assumptions version exists.
- Disclosure version exists.
- Quant reviewer approval exists.
- Compliance reviewer approval exists.
- Artifact hash is immutable.
- Public copy has approval timestamp.

## Data Contracts

Use JSON Schema for the artifact boundary. The first schema is:

- `schemas/research_artifact.schema.json`

The website should treat this schema as the input contract. Python strategy code
can evolve independently as long as exported artifacts satisfy the contract.

## Testing Foundation

P0 checks:

- Python unit tests for research/backtest code.
- Artifact schema validation tests.
- Website smoke test.
- Accessibility checks for public pages.
- Review workflow tests.
- CI gate that fails on invalid artifacts or unapproved publication states.

Current static prototype check:

```bash
node website/smoke-test.mjs
```

Production checks to add after app migration:

- `npm test`
- `npm run lint`
- `npm run build`
- Playwright catalog/report/waitlist flows
- Axe accessibility checks
- Database migration checks

## Security And Compliance Controls

P0:

- Admin auth.
- Role-based approval actions.
- Server-side audit log.
- Immutable artifact hashes.
- Disclosure versioning.
- Consent capture for waitlist.
- No public current buy/sell/hold instructions.
- No arbitrary ticker search or strategy optimization.

P1:

- Security headers/CSP.
- Rate limiting for waitlist/API routes.
- Monitoring and alerting for stale data.
- Backup/restore verification.
- Privacy policy and data retention policy.

## Deferred Decisions

Do not implement until legal/compliance gates clear:

- Paid subscriptions.
- Stripe checkout.
- Entitlements.
- Live or delayed actionable signal delivery.
- User accounts for saved reports.
- Broker integrations.
- Personalized recommendations.

## Sources Reviewed

- Massive/Polygon stock aggregates documentation: https://massive.com/docs/rest/stocks/aggregates/custom-bars
- Tiingo EOD documentation: https://www.tiingo.com/documentation/end-of-day
- EODHD fundamentals documentation: https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds
- TradingView Lightweight Charts documentation: https://tradingview.github.io/lightweight-charts/
- Highcharts Stock documentation: https://www.highcharts.com/blog/products/stock/
- Chart.js documentation: https://www.chartjs.org/docs/latest/
- Next.js documentation: https://nextjs.org/docs
- Vercel documentation: https://vercel.com/docs
- Cloudflare Pages documentation: https://developers.cloudflare.com/pages/
- Supabase Database documentation: https://supabase.com/docs/guides/database/overview
- Supabase Auth documentation: https://supabase.com/docs/guides/auth
- Clerk documentation: https://clerk.com/docs
- Resend documentation: https://resend.com/docs
- Plausible documentation: https://plausible.io/docs
- PostHog documentation: https://posthog.com/docs
- Sentry Next.js documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/

