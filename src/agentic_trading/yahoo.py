"""Optional Yahoo Finance price adapter."""

from __future__ import annotations

from collections import defaultdict
from datetime import date

from agentic_trading.price_data import PriceTable


def fetch_adjusted_closes(symbols: list[str], start: str, end: str | None = None) -> PriceTable:
    """Fetch adjusted daily close data via yfinance."""
    try:
        import yfinance as yf
    except ImportError as exc:
        raise RuntimeError('Install the optional data dependency: python3 -m pip install -e ".[data]"') from exc

    table: defaultdict[date, dict[str, float]] = defaultdict(dict)
    for symbol in symbols:
        history = yf.Ticker(symbol).history(start=start, end=end, auto_adjust=True)
        if history.empty:
            raise RuntimeError(f"Yahoo Finance returned no rows for {symbol}")
        for timestamp, row in history.iterrows():
            row_date = timestamp.date()
            table[row_date][symbol.upper()] = float(row["Close"])

    return dict(sorted(table.items()))
