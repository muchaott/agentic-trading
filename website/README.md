# Strategy Ledger Website Prototype

This directory contains the website product workstream for the ETF strategy research MVP.

The prototype is intentionally self-contained:

- No package install is required.
- No live market data is fetched.
- No trading strategy is generated inside the website.
- Seeded demo research data is used only to demonstrate the product workflow.

Open `index.html` in a browser to use the prototype.

Run the no-dependency smoke test with:

```bash
node website/smoke-test.mjs
```

## Product Surface

The first version includes:

- Research catalog with filters
- Strategy variant report
- Constrained backtest viewer
- Canvas-based equity and drawdown charts
- Methodology overview and versioning treatment
- Data sources, assumptions, risk, conflicts, and disclosure surfaces
- Trust and disclosure checks
- Internal review queue
- Waitlist and pricing-interest capture stored in browser local storage
- Hash-based deep links for `#research`, `#methodology`, `#data-risk`, and `#review`
- No-dependency smoke test for core UI flows

## MVP Boundaries

This prototype does not provide investment advice, paid live signals, brokerage integration,
personalized recommendations, or real performance claims.

The catalog and reports use seeded demo values to exercise the UI only. Backtest controls are
limited to approved windows, benchmark choices, and gross versus estimated net display. Any future
paid access, live signal delivery, or subscription product remains blocked on legal, data-rights,
methodology, conflict-policy, and disclosure review gates.

## Technical Foundation

The website workstream is separated from strategy creation through an immutable research artifact
contract:

- Architecture: `docs/architecture/website_technical_foundation.md`
- Boundary: `docs/architecture/research_website_boundary.md`
- Contract: `docs/contracts/research_artifact_contract.md`
- Schema: `schemas/research_artifact.schema.json`
- Publish runbook: `docs/runbooks/publish_research_artifact.md`
- Demo fixture: `website/data/fixtures/research_artifacts/spy_mean_reversion_demo.json`

Run the artifact contract test with:

```bash
python3 tests/test_research_artifact_contract.py
```

## Accessibility Notes

The prototype uses semantic landmarks, labeled controls, keyboard-reachable navigation, native
dialog behavior, canvas fallback text, and visible focus styles. The waitlist form stores validation
interest locally in the browser and creates no account, payment, advisory relationship, or signal
access.
