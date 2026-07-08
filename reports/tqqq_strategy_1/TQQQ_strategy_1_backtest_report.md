# TQQQ Regime Switch Backtest

Generated: 2026-07-08

## Method

- Source skill guidance: `claude-trading-skills/skills/backtest-expert`.
- Data: Yahoo Finance adjusted daily closes for SPY, QQQ, TQQQ, and BIL.
- Period: 2016-07-08 to 2026-07-07.
- Execution assumption: signal is calculated from completed daily closes and applied to the next close-to-close return.
- Costs: no commissions, no slippage, no taxes.
- Output definition: a trade period is a continuous allocation to either TQQQ or BIL; a new row starts when the target asset changes.

## Summary

- Initial capital: $100,000.00
- Final equity: $1,530,846.15
- CAGR: 31.50%
- Sharpe: 0.82
- Max drawdown: -58.41%
- TQQQ exposure: 76.07%
- Trade periods: 52 (51 allocation changes)
- TQQQ periods: 26; BIL periods: 26
- TQQQ win rate by period: 42.31%
- Current/latest target: TQQQ since 2026-04-08 (weak_uptrend_spy_above_20_sma)

## Yearly Returns

| Year | Return | End Equity |
|---:|---:|---:|
| 2016 | 0.04% | $100,043.74 |
| 2017 | 51.64% | $151,769.13 |
| 2018 | -7.13% | $148,174.85 |
| 2019 | 70.49% | $252,592.72 |
| 2020 | 59.14% | $421,901.58 |
| 2021 | 91.35% | $772,001.02 |
| 2022 | -56.87% | $342,581.55 |
| 2023 | 94.99% | $668,055.81 |
| 2024 | 66.72% | $1,057,316.84 |
| 2025 | 18.04% | $1,240,145.57 |
| 2026 | 24.31% | $1,530,846.15 |

## Trade Log

| # | Start | End | Asset | Trading Days | Return | Entry Reason |
|---:|---|---|---|---:|---:|---|
| 1 | 2016-07-08 | 2017-04-24 | BIL | 199 | 0.15% | `warmup_insufficient_history` |
| 2 | 2017-04-24 | 2018-10-11 | TQQQ | 371 | 75.37% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 3 | 2018-10-11 | 2018-10-12 | BIL | 1 | 0.00% | `bear_gate_spy_below_200_sma` |
| 4 | 2018-10-12 | 2018-10-23 | TQQQ | 7 | -2.43% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 5 | 2018-10-23 | 2018-11-06 | BIL | 10 | 0.08% | `bear_gate_spy_below_200_sma` |
| 6 | 2018-11-06 | 2018-11-12 | TQQQ | 4 | -7.07% | `weak_uptrend_spy_above_20_sma` |
| 7 | 2018-11-12 | 2018-11-28 | BIL | 11 | 0.10% | `bear_gate_spy_below_200_sma` |
| 8 | 2018-11-28 | 2018-11-29 | TQQQ | 1 | -0.92% | `weak_uptrend_spy_above_20_sma` |
| 9 | 2018-11-29 | 2018-11-30 | BIL | 1 | 0.01% | `bear_gate_spy_below_200_sma` |
| 10 | 2018-11-30 | 2018-12-04 | TQQQ | 2 | -6.43% | `weak_uptrend_spy_above_20_sma` |
| 11 | 2018-12-04 | 2019-02-04 | BIL | 40 | 0.37% | `bear_gate_spy_below_200_sma` |
| 12 | 2019-02-04 | 2019-02-07 | TQQQ | 3 | -2.33% | `weak_uptrend_spy_above_20_sma` |
| 13 | 2019-02-07 | 2019-02-12 | BIL | 3 | 0.03% | `bear_gate_spy_below_200_sma` |
| 14 | 2019-02-12 | 2019-05-31 | TQQQ | 75 | 2.19% | `weak_uptrend_spy_above_20_sma` |
| 15 | 2019-05-31 | 2019-06-04 | BIL | 2 | 0.02% | `bear_gate_spy_below_200_sma` |
| 16 | 2019-06-04 | 2020-02-27 | TQQQ | 185 | 49.25% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 17 | 2020-02-27 | 2020-03-02 | BIL | 2 | 0.02% | `bear_gate_spy_below_200_sma` |
| 18 | 2020-03-02 | 2020-03-03 | TQQQ | 1 | -9.42% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 19 | 2020-03-03 | 2020-03-04 | BIL | 1 | 0.04% | `bear_gate_spy_below_200_sma` |
| 20 | 2020-03-04 | 2020-03-05 | TQQQ | 1 | -8.77% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 21 | 2020-03-05 | 2020-05-26 | BIL | 56 | 0.06% | `bear_gate_spy_below_200_sma` |
| 22 | 2020-05-26 | 2022-01-21 | TQQQ | 419 | 187.34% | `weak_uptrend_spy_above_20_sma` |
| 23 | 2022-01-21 | 2022-01-24 | BIL | 1 | 0.01% | `bear_gate_spy_below_200_sma` |
| 24 | 2022-01-24 | 2022-01-25 | TQQQ | 1 | -7.38% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 25 | 2022-01-25 | 2022-01-28 | BIL | 3 | 0.00% | `bear_gate_spy_below_200_sma` |
| 26 | 2022-01-28 | 2022-02-11 | TQQQ | 10 | -5.48% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 27 | 2022-02-11 | 2022-02-15 | BIL | 2 | 0.01% | `bear_gate_spy_below_200_sma` |
| 28 | 2022-02-15 | 2022-02-17 | TQQQ | 2 | -8.88% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 29 | 2022-02-17 | 2022-03-18 | BIL | 20 | 0.02% | `bear_gate_spy_below_200_sma` |
| 30 | 2022-03-18 | 2022-04-11 | TQQQ | 16 | -9.42% | `weak_uptrend_spy_above_20_sma` |
| 31 | 2022-04-11 | 2022-08-16 | BIL | 87 | 0.23% | `bear_gate_spy_below_200_sma` |
| 32 | 2022-08-16 | 2022-08-17 | TQQQ | 1 | -3.47% | `weak_uptrend_spy_above_20_sma` |
| 33 | 2022-08-17 | 2022-11-30 | BIL | 73 | 0.79% | `bear_gate_spy_below_200_sma` |
| 34 | 2022-11-30 | 2022-12-05 | TQQQ | 3 | -5.65% | `weak_uptrend_spy_above_20_sma` |
| 35 | 2022-12-05 | 2022-12-13 | BIL | 6 | 0.10% | `bear_gate_spy_below_200_sma` |
| 36 | 2022-12-13 | 2022-12-14 | TQQQ | 1 | -2.37% | `weak_uptrend_spy_above_20_sma` |
| 37 | 2022-12-14 | 2023-01-11 | BIL | 18 | 0.22% | `bear_gate_spy_below_200_sma` |
| 38 | 2023-01-11 | 2023-01-18 | TQQQ | 4 | 0.26% | `weak_uptrend_spy_above_20_sma` |
| 39 | 2023-01-18 | 2023-01-20 | BIL | 2 | 0.05% | `bear_gate_spy_below_200_sma` |
| 40 | 2023-01-20 | 2023-03-10 | TQQQ | 34 | 2.40% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 41 | 2023-03-10 | 2023-03-14 | BIL | 2 | 0.03% | `bear_gate_spy_below_200_sma` |
| 42 | 2023-03-14 | 2023-03-15 | TQQQ | 1 | 1.45% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 43 | 2023-03-15 | 2023-03-16 | BIL | 1 | 0.04% | `bear_gate_spy_below_200_sma` |
| 44 | 2023-03-16 | 2023-10-25 | TQQQ | 154 | 33.05% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 45 | 2023-10-25 | 2023-11-02 | BIL | 6 | 0.15% | `bear_gate_spy_below_200_sma` |
| 46 | 2023-11-02 | 2025-03-10 | TQQQ | 336 | 67.81% | `weak_uptrend_spy_above_20_sma` |
| 47 | 2025-03-10 | 2025-03-24 | BIL | 10 | 0.15% | `bear_gate_spy_below_200_sma` |
| 48 | 2025-03-24 | 2025-03-26 | TQQQ | 2 | -3.88% | `weak_uptrend_spy_above_20_sma` |
| 49 | 2025-03-26 | 2025-05-12 | BIL | 32 | 0.53% | `bear_gate_spy_below_200_sma` |
| 50 | 2025-05-12 | 2026-03-20 | TQQQ | 215 | 31.02% | `weak_uptrend_spy_above_20_sma` |
| 51 | 2026-03-20 | 2026-04-08 | BIL | 12 | 0.16% | `bear_gate_spy_below_200_sma` |
| 52 | 2026-04-08 | 2026-07-07 | TQQQ | 61 | 50.83% | `weak_uptrend_spy_above_20_sma` |

## Notes

- This is a research backtest, not financial advice or an execution instruction.
- Results will differ from Composer if Composer uses different price data, close/open timing, cash treatment, or indicator conventions.
- The `backtest-expert` guidance recommends adding friction and parameter sensitivity tests before considering live use.
