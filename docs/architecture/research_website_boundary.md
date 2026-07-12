# Research And Website Boundary

Status: Draft  
Date: 2026-07-12

## Boundary

The product has two separate workstreams:

```text
Strategy research workstream
  -> market data import
  -> research and backtest code
  -> artifact export
  -> quant review
  -> compliance review

Website product workstream
  -> artifact ingestion
  -> catalog and research pages
  -> disclosures
  -> waitlist and analytics
  -> admin review workflow
```

The website workstream owns presentation, ingestion, review workflow, analytics,
waitlist, and operational controls. The research workstream owns strategy logic,
data processing, and backtest execution.

## Hard Rules

- No strategy code is imported by the website runtime.
- No user-facing page runs an arbitrary backtest.
- No user-facing control changes unapproved strategy parameters.
- No public page displays a draft artifact.
- No prototype-only data source is used for production claims.
- No current buy, sell, hold, or rebalance instruction is displayed in MVP.
- No paid access is launched before legal, compliance, and data-rights review.

## Allowed Website Interactions

MVP can support:

- Filtering an approved research catalog.
- Comparing approved time windows already present in the artifact.
- Toggling gross versus estimated-net metrics when both are approved.
- Reading methodology, assumptions, and limitations.
- Joining a waitlist.
- Admin review of draft artifacts.

MVP should not support:

- Free-form ticker search.
- Parameter sliders.
- Live market data refresh.
- Portfolio personalization.
- Signal delivery.
- Broker account linking.

## Production Migration Path

1. Keep the current static prototype as product validation.
2. Export research artifacts from the Python pipeline.
3. Validate artifacts with schema tests.
4. Build a read-only ingestion path into Postgres and object storage.
5. Add admin auth, review state transitions, and audit logs.
6. Generate public pages only from published artifacts.
7. Add vendor-licensed data and charting behind the same artifact contract.
