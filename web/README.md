# ETF Mean Reversion Lab

Live website for Strategy 2: ETF Bollinger/RSI Mean Reversion.

The app lets a user select or import ETFs, fetch daily OHLC history, run the
Strategy 2 backtest, review a single ETF's signal history, and compare visible
ETFs in a strategy scoreboard.

## Current MVP Scope

- Client-side Strategy 2 backtests.
- `/api/history` proxy for daily Yahoo chart data.
- Seeded ETF universe in `app/data/etfs.ts`.
- Custom ETF add and CSV import.
- Strategy synthesis score and comparison scoreboard.
- Research-only workflow; no brokerage connection and no trade placement.

## Known Foundation Gaps

- Yahoo is a demo/prototype data source, not a contracted production vendor.
- ETF holdings counts are seeded metadata, not refreshed from an authoritative
  holdings provider.
- Backtest math exists separately in Python and TypeScript; fixture parity tests
  are required before persisted results should be trusted.
- Main chart is custom SVG and should be replaced with a financial charting
  library before signal audit becomes a core workflow.
- Storage is scaffolded but disabled. D1/R2 should be enabled only after the
  data contracts are stable.
- Auth helpers exist, but saved runs/watchlists are not implemented.

See `../docs/technical_foundation_vendor_plan.md` for the vendor plan,
architecture, and release sequence.

## Vendor Direction

- Historical EOD OHLCV: Tiingo EOD first; Polygon/Massive as backup or
  higher-scale market-data provider.
- ETF holdings/universe: Intrinio ETF holdings/reference data candidate.
- Charting: TradingView Lightweight Charts for candles, markers, crosshair, and
  financial time scales.
- Storage: Cloudflare D1 for structured records, R2 for raw payloads/exports,
  KV only for short-lived cache/config.
- Hosting: keep the current Sites/Cloudflare Workers architecture.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Release Checklist

- Python tests pass from the repo root.
- Web build and tests pass from `web/`.
- Strategy 2 execution timing is covered by a no-lookahead fixture.
- Result UI shows data provider, last complete bar date, and adjusted/raw state.
- No API key is exposed to browser code.
- Research-only disclaimer remains visible in product and docs.
