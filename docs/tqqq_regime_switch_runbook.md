# TQQQ Regime Switch Runbook

## Daily Loop

1. Update daily adjusted close data for `SPY`, `QQQ`, `TQQQ`, and `BIL`.
2. Run `python3 -m agentic_trading.cli signal --prices prices.csv`.
3. Read the emitted `target_asset`, `reason`, and indicator inputs.
4. Record the signal artifact under `state/signals/`.
5. Make any broker decision manually; the code does not place orders.
6. Add a short journal note when the signal changes asset or when risk feels uncomfortable.

## Review Loop

Use the trading-skills Plan -> Trade -> Record -> Review -> Improve loop:

- Plan: keep `strategies/tqqq_regime_switch.yaml` as the contract.
- Trade: only act after manual confirmation.
- Record: store signals and decision notes in `state/`.
- Review: compare actual trades with generated targets.
- Improve: change rules only through documented tests and backtest comparisons.

## Backtest Discipline

The first local backtester applies yesterday's signal to today's close-to-close
return. Before treating results as comparable to Composer, explicitly test:

- Composer-compatible execution timing.
- Adjusted versus unadjusted close data.
- Slippage/friction assumptions.
- Year-by-year returns and drawdowns.
- Sensitivity around `200`, `20`, `10`, `79`, and `30`.
