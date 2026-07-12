# Research Artifact Contract

Status: Draft  
Date: 2026-07-12  
Owner: Website product workstream

## Purpose

Research artifacts are the boundary between strategy creation and the public
website product.

The website can display only approved, immutable artifacts exported by the
research pipeline. It must not import strategy implementation code, run
backtests at request time, optimize parameters, or create live trade signals.

Canonical schema:

- `schemas/research_artifact.schema.json`

Demo fixture:

- `website/data/fixtures/research_artifacts/spy_mean_reversion_demo.json`

## Contract Shape

Each artifact contains:

- Identity: schema version, artifact id, artifact hash, created timestamp.
- Instrument: ticker, exchange, asset class, category, and data rights status.
- Strategy: family, variant, rule version, implementation hash, parameters.
- Methodology: methodology version, summary, and known limitations.
- Data: data snapshot id, vendor, date, adjustment method, license scope.
- Assumptions: capital, commissions, slippage, taxes, execution timing.
- Backtest: run id, engine version, sample window, benchmark, creator.
- Metrics: returns, volatility, drawdown, turnover, trades, win rate.
- Series: normalized equity, benchmark equity, drawdown, monthly returns, yearly returns.
- Report: public title, summary, limitations, methodology URL.
- Disclosure: disclosure version and standard risk/advice text.
- Review: draft, quant reviewed, compliance reviewed, published, retired, or archived.

## Publication Invariants

An artifact can be shown on public production pages only when:

- `publication_state` is `published`.
- `content_review.stage` is `published`.
- `content_review.quant_reviewer` is present.
- `content_review.compliance_reviewer` is present.
- `content_review.approved_at` is present.
- `instrument.data_rights_status` is not `prototype_only`.
- `data_snapshot.license_scope` is not `prototype_only`.
- `artifact_hash` is stable and references the canonical payload.
- `strategy_rule_version.implementation_hash` is stable.
- The referenced disclosure version is active.

The prototype fixture is intentionally not published.

## Exporter Expectations

The research pipeline should:

- Export one artifact per approved strategy/ticker/sample-window combination.
- Use deterministic JSON serialization for the payload used to compute hashes.
- Compute `artifact_hash` over the canonical artifact payload excluding the
  `artifact_hash` field itself.
- Use a real implementation hash for the strategy code used in the run.
- Include the vendor data snapshot id and price adjustment method.
- Refuse export when required assumptions or disclosure versions are missing.
- Store the exported JSON and supporting series files as immutable objects.

## Website Expectations

The website should:

- Validate every artifact against the schema before ingestion.
- Treat artifact JSON as read-only display input.
- Store artifact ids and publication states in Postgres.
- Store artifact JSON and supporting files in object storage.
- Render charts from artifact series, not from raw market data.
- Block public display for draft or prototype-only artifacts.
- Show clear hypothetical performance and no-advice disclosures.
- Log admin review and publish actions in an audit table.

## Storage Convention

Recommended object paths:

```text
research-artifacts/{artifact_id}/artifact.json
research-artifacts/{artifact_id}/series/normalized_equity.json
research-artifacts/{artifact_id}/series/drawdown.json
research-artifacts/{artifact_id}/charts/equity.png
research-artifacts/{artifact_id}/review/approval.json
```

Postgres should store artifact metadata, review state, and object references.
The object store should store immutable payloads.
