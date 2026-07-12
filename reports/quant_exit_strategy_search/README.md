# Quant Exit Strategy Search

Last updated: 2026-07-12

## Purpose

The ETF Bollinger/RSI MVP had low CAGR because it treated entry signals as
position state and waited for the opposite signal. That is too crude for
mean-reversion. This research pass created a three-quant review team, tested
explicit exits, and searched for candidate strategies that can clear 20% and,
where possible, 30% CAGR.

This is research only. These results are not financial advice, are not a live
trading recommendation, and are not production-ready.

## Data and Assumptions

- Data source: Yahoo Finance chart API, adjusted daily OHLCV.
- Test window: 2016-07-11 through 2026-07-10.
- Capital: 100,000 initial equity.
- Default costs: 0 bps unless a stress result is shown.
- Cost stress: 5 bps per allocation switch where noted.
- No tax modeling.
- No borrow fees.
- No intraday sequence data.
- Regime tests use close-to-close allocation, consistent with existing Strategy 1.
- Mean-reversion exit tests use next-open entry after a completed signal and
  daily OHLC exit simulation.

Daily OHLC caveat: when a stop and target are both touched in the same daily bar,
the mean-reversion tests assume the stop is hit first. That is intentionally
conservative, but still less precise than intraday data.

## Quant Team Review

### Quant 1: Macro / Regime

View:

- The existing TQQQ strategy already clears 30% CAGR, but its drawdown is too
  high.
- The most useful macro improvement is to add Nasdaq-specific trend confirmation
  using QQQ or sector-specific confirmation using SMH.
- Reordering the overbought RSI branch before trend entry makes the dormant
  cooldown logic active.

Preferred changes:

- For TQQQ: require QQQ trend confirmation in addition to SPY regime.
- For SOXL: use SMH trend as the primary signal and SPY as the broad-market
  safety gate.
- Add a volatility brake so leveraged exposure is reduced during high realized
  volatility.

### Quant 2: Microstructure / Exits

View:

- Fixed 4% profit targets and fixed 4% stops are too arbitrary across ETFs.
- Exits should scale with volatility and should have a defined trade lifecycle.
- For mean-reversion, the thesis is complete when price reverts to the middle
  band or RSI normalizes.

Preferred exits:

- ATR triple barrier: target, stop, max holding period.
- Middle-band / RSI normalization exit.
- Time stop for failed bounces.
- Gap-aware stop/target fills.

### Quant 3: Risk / Robustness

View:

- CAGR over 30% is achievable mainly with leveraged ETFs. That is not the same
  as robust edge.
- Any high-CAGR candidate must be reported with drawdown, exposure, trade count,
  train/test split, and cost stress.
- Pure ETF mean-reversion did not honestly clear 30% CAGR in the full sample
  under daily-bar assumptions.

Required next validation:

- Add production strategy code only after parity tests and execution semantics
  are fixed.
- Run walk-forward validation, parameter perturbation, and higher slippage/tax
  stress.
- Report rolling 1-year and 3-year behavior before using the scores in product.

## Result Summary

| Candidate | Theme | Full CAGR | Test CAGR 2022-2026 | Max DD | Sharpe | Trades | Exposure | Verdict |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| A | TQQQ Nasdaq regime cooldown | 53.68% | 40.48% | -37.33% | 1.22 | 99 | 66.4% | Clears 30%, best next candidate |
| B | SOXL semiconductor regime cooldown | 63.28% | 59.28% | -55.10% | 1.07 | 116 | 64.3% | Clears 30%, independent but very aggressive |
| C | SOXL/SMH explicit mean-reversion exits | 27.84% | 31.30% | -34.15% | 0.92 | 70 | 8.1% | Clears 20%, exit model worth productizing |
| Baseline | Existing TQQQ Strategy 1, refreshed | 32.03% | Not selected | -58.41% | 0.82 | 51 | 76.1% | Clears 30%, but too much drawdown |

## Candidate A: TQQQ Nasdaq Regime Cooldown

Goal: keep the existing TQQQ upside engine, but avoid more of the bear-market
and overbought churn.

Instrument:

- Risk asset: TQQQ
- Defensive asset: BIL

Rules:

1. Stay in BIL during indicator warmup.
2. Stay in BIL if `SPY close < SPY 200d SMA`.
3. Stay in BIL if `QQQ close < QQQ 180d SMA`.
4. Stay in BIL if `TQQQ RSI(10) > 79`; then apply a 3-trading-day cooldown.
5. Stay in BIL during cooldown.
6. Stay in BIL if `QQQ 20d realized volatility > 35%`.
7. Enter or hold TQQQ if `SPY 10d SMA > SPY 200d SMA` and
   `QQQ 50d SMA > QQQ 180d SMA`.
8. Enter or hold TQQQ if `QQQ RSI(10) < 30` and `QQQ close > QQQ 180d SMA`.
9. Enter or hold TQQQ if `SPY close > SPY 20d SMA`.
10. Otherwise hold BIL.

Backtest:

- Full sample CAGR: 53.68%
- Full sample Sharpe: 1.22
- Full sample max drawdown: -37.33%
- Trades: 99
- Exposure: 66.4%
- Ending equity: 7,261,511
- Train CAGR, 2016-07-11 to 2021-12-31: 64.58%
- Test CAGR, 2022-01-03 to 2026-07-10: 40.48%
- 5 bps cost stress CAGR: 52.92%
- 10 bps cost stress CAGR: 52.16%

Why it works in-sample:

- The QQQ gate aligns the leveraged ETF with its actual Nasdaq driver.
- The active RSI cooldown avoids some blow-off continuation risk.
- The volatility brake removes TQQQ during high-volatility regimes where
  leveraged ETF decay is most painful.

Main concern:

- This is still a leveraged trend/regime strategy, not classic mean-reversion.
  It clears the target, but it needs robustness work before promotion.

## Candidate B: SOXL Semiconductor Regime Cooldown

Goal: apply the same regime/cooldown concept to a different leveraged sleeve:
semiconductors.

Instrument:

- Risk asset: SOXL
- Signal asset: SMH
- Defensive asset: BIL

Rules:

1. Stay in BIL during indicator warmup.
2. Stay in BIL if `SPY close < SPY 200d SMA`.
3. Stay in BIL if `SMH close < SMH 200d SMA`.
4. Stay in BIL if `SOXL RSI(10) > 79`.
5. Stay in BIL if `SMH 20d realized volatility > 40%`.
6. Enter or hold SOXL if `SMH 20d SMA > SMH 200d SMA`.
7. Enter or hold SOXL if `SMH RSI(10) < 30` and `SMH close > SMH 200d SMA`.
8. Enter or hold SOXL if `SMH close > SMH 20d SMA`.
9. Otherwise hold BIL.

Backtest:

- Full sample CAGR: 63.28%
- Full sample Sharpe: 1.07
- Full sample max drawdown: -55.10%
- Trades: 116
- Exposure: 64.3%
- Ending equity: 13,288,287
- Train CAGR, 2016-07-11 to 2021-12-31: 64.87%
- Test CAGR, 2022-01-03 to 2026-07-10: 59.28%
- 5 bps cost stress CAGR: 62.33%

Why it works in-sample:

- Semiconductor beta was extremely rewarding in this window.
- The SMH 200d trend gate avoids some catastrophic SOXL compounding.
- The volatility brake cuts exposure in the nastiest high-volatility windows.

Main concern:

- This is very aggressive. The max drawdown is still roughly -55%, so the CAGR
  is not free. It belongs in the "high return / high pain" bucket.

## Candidate C: SOXL/SMH Explicit Mean-Reversion Exits

Goal: directly address the original issue: add explicit exits after a
mean-reversion entry.

Instrument:

- Risk asset: SOXL
- Signal asset: SMH
- Macro gate: SMH above its 200d SMA

Entry:

1. Compute Bollinger Bands(20, 2.0) and RSI(14) on SMH.
2. After the close, open a SOXL long at the next open if:
   - SMH low touched or crossed below the lower Bollinger Band,
   - SMH RSI(14) <= 40,
   - SMH close > SMH 200d SMA.

Exit:

1. Profit target: `entry + 2.0 * ATR(14)` on SOXL.
2. Stop loss: `entry - 1.5 * ATR(14)` on SOXL.
3. Mean-reversion exit: exit at next open if completed SMH close reaches the
   middle Bollinger Band or SMH RSI(14) >= 50.
4. Time stop: exit after 20 trading days.
5. Gap handling:
   - If open gaps beyond stop or target, fill at open.
   - If daily high and low both touch target and stop, assume stop first.

Backtest:

- Full sample CAGR: 27.84%
- Full sample Sharpe: 0.92
- Full sample max drawdown: -34.15%
- Trades: 70
- Exposure: 8.1%
- Win rate: 74.3%
- Ending equity: 1,158,150
- Train CAGR, 2016-07-11 to 2021-12-31: 25.07%
- Test CAGR, 2022-01-03 to 2026-07-10: 31.30%
- 5 bps cost stress CAGR: 27.39%

Why it works in-sample:

- It is selective: only 8.1% exposure.
- It uses a sector ETF signal and a leveraged execution sleeve.
- Exit logic matches the thesis: exit on snapback, ATR target/stop, or failed
  bounce.

Main concern:

- It does not clear 30% full-sample CAGR, so it should be framed as the best
  explicit-exit mean-reversion candidate found in this pass, not as one of the
  two 30% strategies.

## Challenge to the 4% / 4% Example

The user's example was directionally right: split exits, profit-taking, trailing
protection, and full-stop protection are all valid ideas. The weak point is the
fixed 4% number.

Problems:

- A 4% move is not the same risk in SPY, SMH, SOXL, ARKK, or TQQQ.
- Fixed-percent exits ignore volatility regimes.
- Daily OHLC cannot prove whether a 4% target or 4% stop hit first intraday.
- A trailing runner can accidentally convert a mean-reversion system into a
  trend-following system.
- Short signals should not be assumed symmetric with long signals because
  equity ETFs have positive drift and shorts have different risk/cost behavior.

Better default:

- Use ATR-scaled barriers.
- Use the middle Bollinger Band and RSI normalization as thesis-completion
  exits.
- Add a max holding period so failed bounces are cut.
- Treat shorts separately and conservatively.

## Recommendation

Promote Candidate A and Candidate C to the next engineering sprint:

- Candidate A because it clears the user's 30% target with better drawdown than
  the existing baseline.
- Candidate C because it directly fixes the mean-reversion exit problem and
  clears 20% without high exposure.

Keep Candidate B as a high-octane research candidate, not the first product
strategy. Its CAGR is excellent, but the drawdown and sector concentration are
too high for a default user-facing strategy.

## Next Work

1. Implement Candidate C first in Strategy 2 because it addresses the actual exit
   flaw.
2. Add Strategy 3 as Candidate A only after the no-lookahead execution framework
   is fixed.
3. Add OHLCV fixtures for stop/target ambiguity.
4. Run parameter perturbation around:
   - QQQ/SMH trend windows,
   - RSI exit thresholds,
   - volatility thresholds,
   - ATR target/stop ratios,
   - max holding periods.
5. Run rolling 1-year and 3-year windows before publishing these scores in the
   website.
