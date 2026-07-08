"""Dependency-free daily allocation backtester."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from math import sqrt

from agentic_trading.price_data import PriceTable
from agentic_trading.strategies.tqqq_regime_switch import StrategyDecision, generate_decisions

TRADING_DAYS = 252


@dataclass(frozen=True)
class EquityPoint:
    date: date
    equity: float
    target_asset: str
    reason: str
    daily_return: float


@dataclass(frozen=True)
class BacktestResult:
    initial_cash: float
    final_equity: float
    cagr: float
    sharpe: float
    max_drawdown: float
    exposure_tqqq: float
    trades: int
    equity_curve: list[EquityPoint]


def run_backtest(price_table: PriceTable, initial_cash: float = 100_000.0) -> BacktestResult:
    """Run a next-day close-to-close allocation backtest."""
    if initial_cash <= 0:
        raise ValueError("initial_cash must be positive")

    decisions = generate_decisions(price_table)
    if len(decisions) < 2:
        raise ValueError("at least two price rows are required")

    dates = sorted(price_table)
    decision_by_date = {decision.date: decision for decision in decisions}
    equity = initial_cash
    peak = initial_cash
    max_drawdown = 0.0
    daily_returns: list[float] = []
    curve: list[EquityPoint] = [
        EquityPoint(dates[0], equity, decision_by_date[dates[0]].target_asset, "start", 0.0)
    ]

    previous_asset = decision_by_date[dates[0]].target_asset
    trades = 0
    tqqq_days = 0

    for index in range(1, len(dates)):
        previous_date = dates[index - 1]
        current_date = dates[index]
        prior_decision = decision_by_date[previous_date]
        asset = prior_decision.target_asset
        if asset == "TQQQ":
            tqqq_days += 1
        if asset != previous_asset:
            trades += 1
            previous_asset = asset

        previous_close = price_table[previous_date][asset]
        current_close = price_table[current_date][asset]
        daily_return = (current_close / previous_close) - 1.0
        daily_returns.append(daily_return)
        equity *= 1.0 + daily_return
        peak = max(peak, equity)
        drawdown = (equity / peak) - 1.0
        max_drawdown = min(max_drawdown, drawdown)
        curve.append(EquityPoint(current_date, equity, asset, prior_decision.reason, daily_return))

    years = len(daily_returns) / TRADING_DAYS
    cagr = (equity / initial_cash) ** (1.0 / years) - 1.0 if years > 0 else 0.0
    sharpe = _annualized_sharpe(daily_returns)
    exposure_tqqq = tqqq_days / len(daily_returns) if daily_returns else 0.0

    return BacktestResult(
        initial_cash=initial_cash,
        final_equity=equity,
        cagr=cagr,
        sharpe=sharpe,
        max_drawdown=max_drawdown,
        exposure_tqqq=exposure_tqqq,
        trades=trades,
        equity_curve=curve,
    )


def _annualized_sharpe(returns: list[float]) -> float:
    if len(returns) < 2:
        return 0.0
    mean = sum(returns) / len(returns)
    variance = sum((value - mean) ** 2 for value in returns) / (len(returns) - 1)
    if variance == 0:
        return 0.0
    return (mean / sqrt(variance)) * sqrt(TRADING_DAYS)
