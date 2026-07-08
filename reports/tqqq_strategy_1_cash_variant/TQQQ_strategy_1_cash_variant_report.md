# TQQQ Strategy 1 Cash Variant Backtest

Generated: 2026-07-08

## Question

What happens if Strategy 1 replaces every BIL allocation with cash?

## Method

- Same Strategy 1 signal tree.
- Same saved Yahoo Finance adjusted close data as Strategy 1.
- When the original strategy targets `BIL`, this variant targets `CASH` instead.
- Cash earns exactly `0.00%` per day.
- No commissions, no slippage, no taxes.
- Signal timing remains completed close signal applied to next close-to-close return.

## Result

- Final equity: $1,479,907.26
- CAGR: 31.05%
- Sharpe: 0.81
- Max drawdown: -58.89%
- TQQQ exposure: 76.07%
- Trade periods: 52 (51 allocation changes)

## Comparison vs Strategy 1 with BIL

| Metric | Strategy 1: BIL | Cash Variant | Difference |
|---|---:|---:|---:|
| Final equity | $1,530,846.15 | $1,479,907.26 | $-50,938.89 |
| CAGR | 31.50% | 31.05% | -0.45% pts |
| Sharpe | 0.82 | 0.81 | -0.01 |
| Max drawdown | -58.41% | -58.89% | -0.48% pts |

## Yearly Returns

| Year | Return | End Equity |
|---:|---:|---:|
| 2016 | 0.00% | $100,000.00 |
| 2017 | 51.54% | $151,540.31 |
| 2018 | -7.47% | $147,418.74 |
| 2019 | 70.05% | $250,686.69 |
| 2020 | 58.94% | $418,201.34 |
| 2021 | 91.35% | $765,230.26 |
| 2022 | -57.45% | $335,020.03 |
| 2023 | 94.39% | $651,259.57 |
| 2024 | 66.72% | $1,030,733.81 |
| 2025 | 17.24% | $1,200,767.71 |
| 2026 | 24.12% | $1,479,907.26 |

## Trade Log

| # | Start | End | Asset | Trading Days | Return | Entry Reason |
|---:|---|---|---|---:|---:|---|
| 1 | 2016-07-08 | 2017-04-24 | CASH | 199 | 0.00% | `warmup_insufficient_history_to_cash` |
| 2 | 2017-04-24 | 2018-10-11 | TQQQ | 371 | 75.37% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 3 | 2018-10-11 | 2018-10-12 | CASH | 1 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 4 | 2018-10-12 | 2018-10-23 | TQQQ | 7 | -2.43% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 5 | 2018-10-23 | 2018-11-06 | CASH | 10 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 6 | 2018-11-06 | 2018-11-12 | TQQQ | 4 | -7.07% | `weak_uptrend_spy_above_20_sma` |
| 7 | 2018-11-12 | 2018-11-28 | CASH | 11 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 8 | 2018-11-28 | 2018-11-29 | TQQQ | 1 | -0.92% | `weak_uptrend_spy_above_20_sma` |
| 9 | 2018-11-29 | 2018-11-30 | CASH | 1 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 10 | 2018-11-30 | 2018-12-04 | TQQQ | 2 | -6.43% | `weak_uptrend_spy_above_20_sma` |
| 11 | 2018-12-04 | 2019-02-04 | CASH | 40 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 12 | 2019-02-04 | 2019-02-07 | TQQQ | 3 | -2.33% | `weak_uptrend_spy_above_20_sma` |
| 13 | 2019-02-07 | 2019-02-12 | CASH | 3 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 14 | 2019-02-12 | 2019-05-31 | TQQQ | 75 | 2.19% | `weak_uptrend_spy_above_20_sma` |
| 15 | 2019-05-31 | 2019-06-04 | CASH | 2 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 16 | 2019-06-04 | 2020-02-27 | TQQQ | 185 | 49.25% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 17 | 2020-02-27 | 2020-03-02 | CASH | 2 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 18 | 2020-03-02 | 2020-03-03 | TQQQ | 1 | -9.42% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 19 | 2020-03-03 | 2020-03-04 | CASH | 1 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 20 | 2020-03-04 | 2020-03-05 | TQQQ | 1 | -8.77% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 21 | 2020-03-05 | 2020-05-26 | CASH | 56 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 22 | 2020-05-26 | 2022-01-21 | TQQQ | 419 | 187.34% | `weak_uptrend_spy_above_20_sma` |
| 23 | 2022-01-21 | 2022-01-24 | CASH | 1 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 24 | 2022-01-24 | 2022-01-25 | TQQQ | 1 | -7.38% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 25 | 2022-01-25 | 2022-01-28 | CASH | 3 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 26 | 2022-01-28 | 2022-02-11 | TQQQ | 10 | -5.48% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 27 | 2022-02-11 | 2022-02-15 | CASH | 2 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 28 | 2022-02-15 | 2022-02-17 | TQQQ | 2 | -8.88% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 29 | 2022-02-17 | 2022-03-18 | CASH | 20 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 30 | 2022-03-18 | 2022-04-11 | TQQQ | 16 | -9.42% | `weak_uptrend_spy_above_20_sma` |
| 31 | 2022-04-11 | 2022-08-16 | CASH | 87 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 32 | 2022-08-16 | 2022-08-17 | TQQQ | 1 | -3.47% | `weak_uptrend_spy_above_20_sma` |
| 33 | 2022-08-17 | 2022-11-30 | CASH | 73 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 34 | 2022-11-30 | 2022-12-05 | TQQQ | 3 | -5.65% | `weak_uptrend_spy_above_20_sma` |
| 35 | 2022-12-05 | 2022-12-13 | CASH | 6 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 36 | 2022-12-13 | 2022-12-14 | TQQQ | 1 | -2.37% | `weak_uptrend_spy_above_20_sma` |
| 37 | 2022-12-14 | 2023-01-11 | CASH | 18 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 38 | 2023-01-11 | 2023-01-18 | TQQQ | 4 | 0.26% | `weak_uptrend_spy_above_20_sma` |
| 39 | 2023-01-18 | 2023-01-20 | CASH | 2 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 40 | 2023-01-20 | 2023-03-10 | TQQQ | 34 | 2.40% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 41 | 2023-03-10 | 2023-03-14 | CASH | 2 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 42 | 2023-03-14 | 2023-03-15 | TQQQ | 1 | 1.45% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 43 | 2023-03-15 | 2023-03-16 | CASH | 1 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 44 | 2023-03-16 | 2023-10-25 | TQQQ | 154 | 33.05% | `confirmed_uptrend_spy_above_200_and_10_above_200` |
| 45 | 2023-10-25 | 2023-11-02 | CASH | 6 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 46 | 2023-11-02 | 2025-03-10 | TQQQ | 336 | 67.81% | `weak_uptrend_spy_above_20_sma` |
| 47 | 2025-03-10 | 2025-03-24 | CASH | 10 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 48 | 2025-03-24 | 2025-03-26 | TQQQ | 2 | -3.88% | `weak_uptrend_spy_above_20_sma` |
| 49 | 2025-03-26 | 2025-05-12 | CASH | 32 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 50 | 2025-05-12 | 2026-03-20 | TQQQ | 215 | 31.02% | `weak_uptrend_spy_above_20_sma` |
| 51 | 2026-03-20 | 2026-04-08 | CASH | 12 | 0.00% | `bear_gate_spy_below_200_sma_to_cash` |
| 52 | 2026-04-08 | 2026-07-07 | TQQQ | 61 | 50.83% | `weak_uptrend_spy_above_20_sma` |

## Takeaway

Replacing BIL with cash slightly lowers return and Sharpe over this sample because BIL contributed positive yield during defensive windows. Drawdown is effectively unchanged because the deepest losses came from TQQQ exposure around regime transitions, not from the defensive asset.
