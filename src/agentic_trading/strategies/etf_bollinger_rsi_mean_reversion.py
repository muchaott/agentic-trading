"""ETF Bollinger Band / RSI mean-reversion strategy."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from math import sqrt
from typing import Literal

from agentic_trading.indicators import bollinger_bands, rsi_wilder

Signal = Literal["bullish", "bearish", "neutral", "warmup"]
PositionMode = Literal["long_cash", "long_short"]
OhlcTable = dict[date, dict[str, float]]

TRADING_DAYS = 252


@dataclass(frozen=True)
class MeanReversionSettings:
    bb_period: int = 20
    bb_deviations: float = 2.0
    rsi_period: int = 14
    overbought: float = 70.0
    oversold: float = 30.0
    position_mode: PositionMode = "long_cash"


@dataclass(frozen=True)
class MeanReversionDecision:
    date: date
    signal: Signal
    position: int
    reason: str
    close: float
    rsi: float | None
    lower_band: float | None
    upper_band: float | None


@dataclass(frozen=True)
class MeanReversionEquityPoint:
    date: date
    equity: float
    position: int
    signal: Signal
    daily_return: float


@dataclass(frozen=True)
class MeanReversionBacktestResult:
    symbol: str
    initial_cash: float
    final_equity: float
    cagr: float
    sharpe: float
    max_drawdown: float
    exposure: float
    trades: int
    decisions: list[MeanReversionDecision]
    equity_curve: list[MeanReversionEquityPoint]


def generate_decisions(
    symbol: str,
    ohlc_table: OhlcTable,
    settings: MeanReversionSettings | None = None,
) -> list[MeanReversionDecision]:
    """Generate completed-candle signals for one ETF."""
    active_settings = settings or MeanReversionSettings()
    _validate_ohlc_table(symbol, ohlc_table)
    dates = sorted(ohlc_table)
    closes = [ohlc_table[row_date]["close"] for row_date in dates]
    highs = [ohlc_table[row_date]["high"] for row_date in dates]
    lows = [ohlc_table[row_date]["low"] for row_date in dates]
    bands = bollinger_bands(closes, active_settings.bb_period, active_settings.bb_deviations)
    rsi_values = rsi_wilder(closes, active_settings.rsi_period)

    decisions: list[MeanReversionDecision] = []
    position = 0
    for index, row_date in enumerate(dates):
        band = bands[index]
        rsi = rsi_values[index]
        signal, reason = _classify_signal(
            high=highs[index],
            low=lows[index],
            band=band,
            rsi=rsi,
            settings=active_settings,
        )
        if signal == "bullish":
            position = 1
        elif signal == "bearish":
            position = -1 if active_settings.position_mode == "long_short" else 0
        decisions.append(
            MeanReversionDecision(
                date=row_date,
                signal=signal,
                position=position,
                reason=reason,
                close=closes[index],
                rsi=rsi,
                lower_band=band[0] if band else None,
                upper_band=band[2] if band else None,
            )
        )
    return decisions


def run_backtest(
    symbol: str,
    ohlc_table: OhlcTable,
    initial_cash: float = 100_000.0,
    settings: MeanReversionSettings | None = None,
) -> MeanReversionBacktestResult:
    """Run a next-bar close-to-close backtest for one ETF strategy instance."""
    if initial_cash <= 0:
        raise ValueError("initial_cash must be positive")

    decisions = generate_decisions(symbol, ohlc_table, settings)
    if len(decisions) < 2:
        raise ValueError("at least two OHLC rows are required")

    dates = sorted(ohlc_table)
    equity = initial_cash
    peak = initial_cash
    max_drawdown = 0.0
    returns: list[float] = []
    trades = 0
    active_days = 0
    previous_position = decisions[0].position
    curve = [
        MeanReversionEquityPoint(dates[0], equity, previous_position, decisions[0].signal, 0.0)
    ]

    for index in range(1, len(dates)):
        prior_decision = decisions[index - 1]
        current_position = prior_decision.position
        if current_position != previous_position:
            trades += 1
            previous_position = current_position
        if current_position != 0:
            active_days += 1

        previous_close = ohlc_table[dates[index - 1]]["close"]
        current_close = ohlc_table[dates[index]]["close"]
        asset_return = (current_close / previous_close) - 1.0
        strategy_return = current_position * asset_return
        returns.append(strategy_return)
        equity *= 1.0 + strategy_return
        peak = max(peak, equity)
        max_drawdown = min(max_drawdown, (equity / peak) - 1.0)
        curve.append(
            MeanReversionEquityPoint(
                date=dates[index],
                equity=equity,
                position=current_position,
                signal=prior_decision.signal,
                daily_return=strategy_return,
            )
        )

    years = len(returns) / TRADING_DAYS
    cagr = (equity / initial_cash) ** (1.0 / years) - 1.0 if years > 0 else 0.0

    return MeanReversionBacktestResult(
        symbol=symbol.upper(),
        initial_cash=initial_cash,
        final_equity=equity,
        cagr=cagr,
        sharpe=_annualized_sharpe(returns),
        max_drawdown=max_drawdown,
        exposure=active_days / len(returns) if returns else 0.0,
        trades=trades,
        decisions=decisions,
        equity_curve=curve,
    )


def _classify_signal(
    high: float,
    low: float,
    band: tuple[float, float, float] | None,
    rsi: float | None,
    settings: MeanReversionSettings,
) -> tuple[Signal, str]:
    if band is None or rsi is None:
        return "warmup", "warmup_insufficient_history"
    lower, _middle, upper = band
    if high >= upper and rsi > settings.overbought:
        return "bearish", "high_touched_upper_band_and_rsi_overbought"
    if low <= lower and rsi < settings.oversold:
        return "bullish", "low_touched_lower_band_and_rsi_oversold"
    return "neutral", "no_confirmed_touch_rsi_signal"


def _validate_ohlc_table(symbol: str, ohlc_table: OhlcTable) -> None:
    if not symbol.strip():
        raise ValueError("symbol is required")
    if not ohlc_table:
        raise ValueError("OHLC table is empty")
    for row_date, row in ohlc_table.items():
        missing = [field for field in ("open", "high", "low", "close") if field not in row]
        if missing:
            raise ValueError(f"missing {', '.join(missing)} on {row_date}")


def _annualized_sharpe(returns: list[float]) -> float:
    if len(returns) < 2:
        return 0.0
    mean = sum(returns) / len(returns)
    variance = sum((value - mean) ** 2 for value in returns) / (len(returns) - 1)
    if variance == 0:
        return 0.0
    return (mean / sqrt(variance)) * sqrt(TRADING_DAYS)
