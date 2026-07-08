"""Small dependency-free technical indicators."""

from __future__ import annotations

from collections.abc import Sequence


def sma(values: Sequence[float], period: int) -> list[float | None]:
    """Return simple moving average values aligned to the input sequence."""
    if period <= 0:
        raise ValueError("period must be positive")

    result: list[float | None] = [None] * len(values)
    window_sum = 0.0
    for index, value in enumerate(values):
        window_sum += float(value)
        if index >= period:
            window_sum -= float(values[index - period])
        if index >= period - 1:
            result[index] = window_sum / period
    return result


def rsi_wilder(values: Sequence[float], period: int) -> list[float | None]:
    """Return Wilder RSI values aligned to the input sequence."""
    if period <= 0:
        raise ValueError("period must be positive")
    if len(values) <= period:
        return [None] * len(values)

    result: list[float | None] = [None] * len(values)
    gains: list[float] = []
    losses: list[float] = []

    for index in range(1, period + 1):
        change = float(values[index]) - float(values[index - 1])
        gains.append(max(change, 0.0))
        losses.append(max(-change, 0.0))

    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    result[period] = _rsi_from_averages(avg_gain, avg_loss)

    for index in range(period + 1, len(values)):
        change = float(values[index]) - float(values[index - 1])
        gain = max(change, 0.0)
        loss = max(-change, 0.0)
        avg_gain = ((avg_gain * (period - 1)) + gain) / period
        avg_loss = ((avg_loss * (period - 1)) + loss) / period
        result[index] = _rsi_from_averages(avg_gain, avg_loss)

    return result


def _rsi_from_averages(avg_gain: float, avg_loss: float) -> float:
    if avg_gain == 0 and avg_loss == 0:
        return 50.0
    if avg_loss == 0:
        return 100.0
    if avg_gain == 0:
        return 0.0
    relative_strength = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + relative_strength))
