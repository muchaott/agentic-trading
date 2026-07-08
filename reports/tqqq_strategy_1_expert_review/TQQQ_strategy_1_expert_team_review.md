# TQQQ Strategy 1 Expert Team Review

Generated: 2026-07-08

## Strategies Reviewed

1. **Strategy 1 with BIL**  
   The original TQQQ Regime Switch. Defensive periods allocate to `BIL`.

2. **Strategy 1 Cash Variant**  
   Same signal tree and same TQQQ allocations, but every `BIL` period is replaced with `CASH` earning `0.00%` daily.

Backtest period for both: `2016-07-08` to `2026-07-07`.

## Final Decision

**Pick Strategy 1 with BIL as the best default.**

The expert team does not view BIL as solving the strategy's main risk. The main risk is still leveraged TQQQ exposure around regime transitions. But if we must pick one implementation from the two tested versions, the BIL version is better on the measured backtest:

| Metric | Strategy 1 with BIL | Cash Variant | Winner |
|---|---:|---:|---|
| Final equity | `$1,530,846.15` | `$1,479,907.26` | BIL |
| CAGR | `31.50%` | `31.05%` | BIL |
| Sharpe | `0.82` | `0.81` | BIL |
| Max drawdown | `-58.41%` | `-58.89%` | BIL |
| TQQQ exposure | `76.07%` | `76.07%` | Tie |
| Trade periods | `52` | `52` | Tie |

## Committee Votes

### Performance/Risk Quant

**Pick: BIL**

The BIL version wins modestly but consistently. It ends about `$50.9k` ahead on a `$100k` start, has slightly better CAGR and Sharpe, and has a slightly less severe max drawdown. The practical investor experience remains difficult in both versions because both still suffer drawdowns near `-58%`.

Top concerns:

- Severe drawdown risk.
- Whipsaw risk around regime transitions.
- Backtest optimism from no slippage, commissions, taxes, or execution drift.

### Robustness/Overfitting Quant

**Pick for validation baseline: Cash**  
**Pick for implementation: BIL is acceptable, but not because it reduces core risk**

The cash variant is useful because it proves the strategy is not dependent on defensive-asset yield. The difference between cash and BIL is small relative to the total outcome. That means the real model is the TQQQ timing engine, not the defensive sleeve.

Top concerns:

- The saved sample starts in 2016, which is not long enough for high confidence.
- The RSI branches did not materially validate in the saved run.
- Parameter sensitivity around `200`, `20`, `10`, `79`, and `30` still needs testing.
- The strategy needs friction, tax, delayed-execution, and regime-slice tests.

### Execution/Operations Quant

**Pick: depends on account type**

- Prefer **cash** for taxable/manual execution accounts if broker cash sweep or a money-market vehicle pays a competitive yield.
- Prefer **BIL** in tax-advantaged accounts or low-sweep brokers where capturing T-bill yield matters and the extra ETF leg is acceptable.

Operational concerns:

- Signals are only known after completed closes, so live execution requires next-session execution.
- Full sleeve flips can generate tax lots and monitoring burden.
- BIL adds order-leg, spread, dividend-accounting, and ETF-settlement details.
- Cash is simpler but underperforms if modeled as `0%` return.

## Practical Recommendation

Use a two-level answer:

1. **Default / model portfolio:** Strategy 1 with BIL.
2. **Taxable manual account with competitive sweep yield:** cash variant may be preferable operationally.

If only one version can be selected for continued development, select **Strategy 1 with BIL** because it wins the measured backtest without increasing TQQQ exposure or trade count.

## What Matters More Than BIL vs Cash

The BIL-vs-cash choice is secondary. The core question is whether the TQQQ timing engine is durable enough to survive live use.

Required next validation:

1. Parameter sweeps for SMA windows and RSI thresholds.
2. Rule-order sensitivity tests.
3. Execution timing tests: next open, next close, delayed by one day.
4. Friction tests: slippage, bid/ask spreads, MOC execution, taxes.
5. Defensive sleeve alternatives: cash sweep, BIL, SGOV, SHV, and direct T-bill proxies.
6. Regime slices: 2018 Q4, 2020 crash, 2022 bear, sideways chop, and rapid recoveries.

## Bottom Line

**Best current version: Strategy 1 with BIL.**

It is not dramatically better than cash, but it is better on return, risk-adjusted return, and drawdown in the saved test. Cash remains a valuable baseline and may be the better operational choice in some taxable/manual contexts.
