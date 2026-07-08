"""CSV price loading helpers."""

from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from pathlib import Path

PriceTable = dict[date, dict[str, float]]


def load_price_csv(path: str | Path) -> PriceTable:
    """Load wide or long close-price CSV data."""
    csv_path = Path(path)
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError("CSV has no header")

        fieldnames = {name.strip() for name in reader.fieldnames}
        if {"date", "symbol", "close"}.issubset(fieldnames):
            return _load_long(reader)
        if "date" in fieldnames:
            return _load_wide(reader)

    raise ValueError("CSV must include either date,symbol,close or date plus ticker columns")


def sorted_symbols(table: PriceTable) -> list[str]:
    symbols = set()
    for row in table.values():
        symbols.update(row)
    return sorted(symbols)


def write_wide_price_csv(table: PriceTable, path: str | Path, symbols: list[str] | None = None) -> None:
    """Write a wide close-price CSV."""
    output_path = Path(path)
    output_symbols = symbols or sorted_symbols(table)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["date", *output_symbols])
        writer.writeheader()
        for row_date in sorted(table):
            row = {"date": row_date.isoformat()}
            for symbol in output_symbols:
                value = table[row_date].get(symbol)
                row[symbol] = "" if value is None else value
            writer.writerow(row)


def _load_long(reader: csv.DictReader) -> PriceTable:
    table: defaultdict[date, dict[str, float]] = defaultdict(dict)
    for row in reader:
        if not row.get("date") or not row.get("symbol") or not row.get("close"):
            continue
        row_date = date.fromisoformat(row["date"])
        symbol = row["symbol"].strip().upper()
        table[row_date][symbol] = float(row["close"])
    return dict(sorted(table.items()))


def _load_wide(reader: csv.DictReader) -> PriceTable:
    table: PriceTable = {}
    for row in reader:
        if not row.get("date"):
            continue
        row_date = date.fromisoformat(row["date"])
        table[row_date] = {}
        for key, value in row.items():
            if key == "date" or value in (None, ""):
                continue
            table[row_date][key.strip().upper()] = float(value)
    return dict(sorted(table.items()))
