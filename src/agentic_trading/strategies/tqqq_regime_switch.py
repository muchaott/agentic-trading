"""TQQQ Regime Switch strategy."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from agentic_trading.indicators import rsi_wilder, sma
from agentic_trading.price_data import PriceTable

REQUIRED_SYMBOLS = ("SPY", "QQQ", "TQQQ", "BIL")
RISK_ASSET = "TQQQ"
DEFENSIVE_ASSET = "BIL"


@dataclass(frozen=True)
class DecisionInputs:
    spy_close: float
    spy_sma_10: float | None
    spy_sma_20: float | None
    spy_sma_200: float | None
    qqq_rsi_10: float | None
    tqqq_rsi_10: float | None


@dataclass(frozen=True)
class StrategyDecision:
    date: date
    target_asset: str
    reason: str
    inputs: DecisionInputs


def decide(inputs: DecisionInputs) -> tuple[str, str]:
    """Return target asset and reason using the first matching rule."""
    if (
        inputs.spy_sma_10 is None
        or inputs.spy_sma_20 is None
        or inputs.spy_sma_200 is None
        or inputs.qqq_rsi_10 is None
        or inputs.tqqq_rsi_10 is None
    ):
        return DEFENSIVE_ASSET, "warmup_insufficient_history"

    if inputs.spy_close < inputs.spy_sma_200:
        return DEFENSIVE_ASSET, "bear_gate_spy_below_200_sma"

    if inputs.spy_close > inputs.spy_sma_200 and inputs.spy_sma_10 > inputs.spy_sma_200:
        return RISK_ASSET, "confirmed_uptrend_spy_above_200_and_10_above_200"

    if inputs.tqqq_rsi_10 > 79:
        return DEFENSIVE_ASSET, "overbought_cooldown_tqqq_rsi_10_above_79"

    if inputs.qqq_rsi_10 < 30:
        return RISK_ASSET, "oversold_dip_qqq_rsi_10_below_30"

    if inputs.spy_close > inputs.spy_sma_20:
        return RISK_ASSET, "weak_uptrend_spy_above_20_sma"

    return DEFENSIVE_ASSET, "chop_default"


def generate_decisions(price_table: PriceTable) -> list[StrategyDecision]:
    """Generate one allocation decision per available date."""
    _validate_price_table(price_table)
    dates = sorted(price_table)

    spy = [price_table[row_date]["SPY"] for row_date in dates]
    qqq = [price_table[row_date]["QQQ"] for row_date in dates]
    tqqq = [price_table[row_date]["TQQQ"] for row_date in dates]

    spy_sma_10 = sma(spy, 10)
    spy_sma_20 = sma(spy, 20)
    spy_sma_200 = sma(spy, 200)
    qqq_rsi_10 = rsi_wilder(qqq, 10)
    tqqq_rsi_10 = rsi_wilder(tqqq, 10)

    decisions: list[StrategyDecision] = []
    for index, row_date in enumerate(dates):
        inputs = DecisionInputs(
            spy_close=spy[index],
            spy_sma_10=spy_sma_10[index],
            spy_sma_20=spy_sma_20[index],
            spy_sma_200=spy_sma_200[index],
            qqq_rsi_10=qqq_rsi_10[index],
            tqqq_rsi_10=tqqq_rsi_10[index],
        )
        target_asset, reason = decide(inputs)
        decisions.append(StrategyDecision(row_date, target_asset, reason, inputs))
    return decisions


def latest_decision(price_table: PriceTable) -> StrategyDecision:
    decisions = generate_decisions(price_table)
    if not decisions:
        raise ValueError("no decisions generated")
    return decisions[-1]


def _validate_price_table(price_table: PriceTable) -> None:
    if not price_table:
        raise ValueError("price table is empty")

    missing: dict[date, list[str]] = {}
    for row_date, row in price_table.items():
        row_missing = [symbol for symbol in REQUIRED_SYMBOLS if symbol not in row]
        if row_missing:
            missing[row_date] = row_missing

    if missing:
        sample_date = sorted(missing)[0]
        symbols = ", ".join(missing[sample_date])
        raise ValueError(f"missing required symbols on {sample_date}: {symbols}")
