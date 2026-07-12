# ADR-0001: Use Precomputed Research Artifacts, Not Live Website Backtests

Status: Accepted  
Date: 2026-07-12

## Context

The product is an ETF strategy research website. The PRD explicitly separates
website product work from strategy creation work. The current repo already has
Python research/backtest code, while the website prototype is a static product
surface with seeded demo data.

A website that calculates arbitrary strategy results at request time would create
product, compliance, performance, reproducibility, and trust risks:

- Users could mine timeframes or parameters.
- Results might differ between sessions.
- Reviewers could not reliably approve every public performance claim.
- The website would become coupled to strategy implementation details.
- A UI control could accidentally become a recommendation engine.

## Decision

The website will consume immutable, precomputed research artifacts.

The website will not:

- Import strategy code at runtime.
- Run arbitrary backtests for users.
- Tune strategy parameters.
- Search every ticker.
- Generate live buy/sell/hold instructions.

Research artifacts must be exported by the research/backtest pipeline, validated
against JSON Schema, reviewed, approved, and then published.

## Consequences

Positive:

- Public performance claims are reproducible.
- Review gates can approve exact artifacts.
- Website and strategy creation work remain separate.
- Caching and static generation become straightforward.
- Compliance disclosures can reference immutable artifact hashes.

Negative:

- Users get less interactivity in MVP.
- New data requires export/review/publish workflow.
- Engineering must build artifact ingestion and validation before dynamic app work.

## Implementation Notes

The first contract is `schemas/research_artifact.schema.json`.

The publication flow is documented in
`docs/runbooks/publish_research_artifact.md`.

