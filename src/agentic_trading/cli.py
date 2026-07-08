"""Command line interface."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from agentic_trading.backtest import run_backtest
from agentic_trading.price_data import load_price_csv, write_wide_price_csv
from agentic_trading.strategies.tqqq_regime_switch import latest_decision


def main() -> None:
    parser = argparse.ArgumentParser(prog="agentic-trading")
    subparsers = parser.add_subparsers(dest="command", required=True)

    fetch_parser = subparsers.add_parser("fetch-yahoo", help="Fetch Yahoo Finance adjusted closes")
    fetch_parser.add_argument("--start", required=True, help="Start date, YYYY-MM-DD")
    fetch_parser.add_argument("--end", help="Exclusive end date, YYYY-MM-DD")
    fetch_parser.add_argument("--output", required=True, help="Output wide CSV path")
    fetch_parser.add_argument("--symbols", nargs="+", default=["SPY", "QQQ", "TQQQ", "BIL"])

    signal_parser = subparsers.add_parser("signal", help="Generate the latest strategy signal")
    signal_parser.add_argument("--prices", required=True, help="Wide or long close-price CSV")
    signal_parser.add_argument("--output", help="Optional JSON output path")

    backtest_parser = subparsers.add_parser("backtest", help="Run the strategy backtest")
    backtest_parser.add_argument("--prices", required=True, help="Wide or long close-price CSV")
    backtest_parser.add_argument("--initial-cash", type=float, default=100_000.0)
    backtest_parser.add_argument("--output", help="Optional JSON output path")

    args = parser.parse_args()

    if args.command == "fetch-yahoo":
        from agentic_trading.yahoo import fetch_adjusted_closes

        prices = fetch_adjusted_closes(args.symbols, start=args.start, end=args.end)
        write_wide_price_csv(prices, args.output, symbols=[symbol.upper() for symbol in args.symbols])
        print(f"wrote {len(prices)} rows to {args.output}")
        return

    prices = load_price_csv(args.prices)

    if args.command == "signal":
        decision = latest_decision(prices)
        _emit_json(_decision_payload(decision), args.output)
        return

    if args.command == "backtest":
        result = run_backtest(prices, initial_cash=args.initial_cash)
        payload = {
            "initial_cash": result.initial_cash,
            "final_equity": result.final_equity,
            "cagr": result.cagr,
            "sharpe": result.sharpe,
            "max_drawdown": result.max_drawdown,
            "exposure_tqqq": result.exposure_tqqq,
            "trades": result.trades,
            "start_date": result.equity_curve[0].date.isoformat(),
            "end_date": result.equity_curve[-1].date.isoformat(),
        }
        _emit_json(payload, args.output)
        return

    raise SystemExit(f"unknown command: {args.command}")


def _decision_payload(decision):
    payload = asdict(decision)
    payload["date"] = decision.date.isoformat()
    return payload


def _emit_json(payload: dict, output: str | None) -> None:
    text = json.dumps(payload, indent=2, sort_keys=True)
    if output:
        Path(output).write_text(text + "\n", encoding="utf-8")
        print(f"wrote {output}")
    else:
        print(text)


if __name__ == "__main__":
    main()
