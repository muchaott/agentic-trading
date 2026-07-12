# Publish Research Artifact Runbook

Status: Draft  
Date: 2026-07-12  
Scope: Website product MVP

## Goal

Publish a reviewed research artifact to the website without coupling the website
to strategy implementation code.

## Inputs

- Exported artifact JSON.
- Supporting series files or embedded series.
- Strategy rule version.
- Backtest engine version.
- Data vendor snapshot.
- Assumptions version.
- Disclosure version.
- Quant reviewer approval.
- Compliance reviewer approval.

## Steps

1. Export artifact from the research pipeline.
2. Validate JSON against `schemas/research_artifact.schema.json`.
3. Confirm `artifact_hash` and `implementation_hash` are stable SHA-256 values.
4. Confirm data vendor and license scope allow the intended display.
5. Confirm the strategy rule text matches the reviewed implementation version.
6. Confirm assumptions are visible and match the report copy.
7. Confirm hypothetical performance disclosures are present.
8. Quant reviewer approves metrics, methodology, limitations, and benchmark.
9. Compliance reviewer approves copy, risk language, and publication state.
10. Upload immutable artifact files to object storage.
11. Insert or update Postgres metadata with object references.
12. Set publication state to `published` only after both approvals exist.
13. Generate or revalidate public pages from the published artifact.
14. Verify catalog, research report, methodology, and disclosure pages.
15. Monitor error reporting and analytics after release.

## Rollback

If an artifact is wrong after publication:

1. Change publication state to `retired`.
2. Keep the artifact object immutable.
3. Publish a corrected artifact with a new id and hash.
4. Add an audit log entry explaining the retirement.
5. Confirm public pages no longer link to the retired artifact.

## Release Checklist

- Schema validation passed.
- Website smoke test passed.
- Quant approval present.
- Compliance approval present.
- Data rights allow display.
- Disclosure version active.
- Public page does not include live trade instructions.
- Public page labels performance as hypothetical, paper live, or live track
  record accurately.
- Waitlist capture and analytics are working.
