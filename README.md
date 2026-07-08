# Agentic Trading

First setup for a strategy-as-code trading workflow. The repo starts with one
manual-execution strategy:

## TQQQ Regime Switch

Goal: ride TQQQ in confirmed uptrends and hold BIL everywhere else.

Universe: `TQQQ`, `BIL`; daily rebalance.

Decision tree, first match wins:

1. `SPY < 200d SMA` -> `BIL`
2. `SPY > 200d SMA` and `SPY 10d SMA > 200d SMA` -> `TQQQ`
3. `TQQQ 10d RSI > 79` -> `BIL`
4. `QQQ 10d RSI < 30` -> `TQQQ`
5. `SPY > 20d SMA` -> `TQQQ`
6. Otherwise -> `BIL`

Backtests compute signals from completed closes and apply the allocation on the
next trading day. This is intentionally conservative to avoid look-ahead bias.

## Quick Start

```bash
python3 -m unittest

# Optional: install live data adapter.
python3 -m pip install -e ".[data]"

# Fetch adjusted close data from Yahoo Finance.
python3 -m agentic_trading.cli fetch-yahoo \
  --start 2010-02-01 \
  --output prices.csv

# Generate latest signal from a CSV file.
python3 -m agentic_trading.cli signal --prices prices.csv

# Run a next-day close-to-close backtest.
python3 -m agentic_trading.cli backtest --prices prices.csv --initial-cash 100000
```

CSV input can be either wide:

```csv
date,SPY,QQQ,TQQQ,BIL
2024-01-02,470.87,396.28,50.10,91.60
```

or long:

```csv
date,symbol,close
2024-01-02,SPY,470.87
2024-01-02,QQQ,396.28
```

## Project Shape

- `strategies/tqqq_regime_switch.yaml` documents the strategy contract.
- `src/agentic_trading/strategies/tqqq_regime_switch.py` implements the rule tree.
- `src/agentic_trading/backtest.py` runs deterministic next-day allocation tests.
- `reports/tqqq_strategy_1/` contains the saved Strategy 1 report, chart, trade log, summary, and price data.
- `scripts/` contains one-off report/chart generators for the saved Strategy 1 package.
- `state/signals/` is for generated daily signal artifacts.
- `state/journal/` is for decision notes and postmortems.

## Guardrails

This repository is research and process tooling only. It does not place trades,
manage broker accounts, or provide financial advice. Live use should remain a
manual workflow: generate signal, review regime/risk, then decide whether to act.
