from __future__ import annotations

import csv
import json
import math
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "src"))

from agentic_trading.backtest import run_backtest  # noqa: E402
from agentic_trading.price_data import PriceTable, write_wide_price_csv  # noqa: E402
from agentic_trading.strategies.tqqq_regime_switch import generate_decisions  # noqa: E402

SYMBOLS = ["SPY", "QQQ", "TQQQ", "BIL"]
START = date(2016, 7, 8)
TODAY = date(2026, 7, 8)
OUTPUT_DIR = REPO / "reports" / "tqqq_strategy_1"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    prices = fetch_yahoo_adjusted(SYMBOLS, START, TODAY)
    write_wide_price_csv(prices, OUTPUT_DIR / "TQQQ_strategy_1_price_data.csv", SYMBOLS)

    decisions = generate_decisions(prices)
    result = run_backtest(prices, initial_cash=100_000)
    trade_periods = build_trade_periods(prices, decisions)
    yearly = build_yearly_returns(result.equity_curve)

    write_trades_csv(trade_periods, OUTPUT_DIR / "TQQQ_strategy_1_trade_log.csv")
    write_summary_json(result, trade_periods, yearly, OUTPUT_DIR / "TQQQ_strategy_1_backtest_summary.json")
    write_markdown(result, trade_periods, yearly, OUTPUT_DIR / "TQQQ_strategy_1_backtest_report.md")


def fetch_yahoo_adjusted(symbols: list[str], start: date, end_inclusive: date) -> PriceTable:
    table: dict[date, dict[str, float]] = {}
    period1 = int(datetime(start.year, start.month, start.day, tzinfo=timezone.utc).timestamp())
    period2 = int(datetime(end_inclusive.year, end_inclusive.month, end_inclusive.day, tzinfo=timezone.utc).timestamp()) + 86400

    for symbol in symbols:
        query = urllib.parse.urlencode(
            {
                "period1": period1,
                "period2": period2,
                "interval": "1d",
                "events": "history",
                "includeAdjustedClose": "true",
            }
        )
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?{query}"
        request = urllib.request.Request(url, headers={"User-Agent": "agentic-trading-backtest/0.1"})
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))

        result = payload["chart"]["result"][0]
        timestamps = result["timestamp"]
        adjclose = result["indicators"]["adjclose"][0]["adjclose"]
        for timestamp, close in zip(timestamps, adjclose, strict=True):
            if close is None:
                continue
            row_date = datetime.fromtimestamp(timestamp, timezone.utc).date()
            table.setdefault(row_date, {})[symbol] = float(close)

    complete = {row_date: row for row_date, row in table.items() if all(symbol in row for symbol in symbols)}
    if not complete:
        raise RuntimeError("No complete price rows fetched")
    return dict(sorted(complete.items()))


def build_trade_periods(prices: PriceTable, decisions) -> list[dict]:
    dates = sorted(prices)
    decision_by_date = {decision.date: decision for decision in decisions}
    periods: list[dict] = []

    current_asset = decision_by_date[dates[0]].target_asset
    current_reason = decision_by_date[dates[0]].reason
    start_index = 0

    for index in range(1, len(dates)):
        prior_decision = decision_by_date[dates[index - 1]]
        next_asset = prior_decision.target_asset
        next_reason = prior_decision.reason
        if next_asset != current_asset:
            periods.append(make_period(prices, dates, start_index, index - 1, current_asset, current_reason))
            start_index = index - 1
            current_asset = next_asset
            current_reason = next_reason

    periods.append(make_period(prices, dates, start_index, len(dates) - 1, current_asset, current_reason))
    for number, period in enumerate(periods, start=1):
        period["trade_number"] = number
    return periods


def make_period(prices: PriceTable, dates: list[date], start_index: int, end_index: int, asset: str, reason: str) -> dict:
    start_date = dates[start_index]
    end_date = dates[end_index]
    entry_price = prices[start_date][asset]
    exit_price = prices[end_date][asset]
    total_return = (exit_price / entry_price) - 1.0
    holding_days = end_index - start_index
    return {
        "trade_number": 0,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "asset": asset,
        "entry_reason": reason,
        "holding_trading_days": holding_days,
        "entry_price": entry_price,
        "exit_price": exit_price,
        "return_pct": total_return * 100,
    }


def build_yearly_returns(equity_curve) -> list[dict]:
    years = sorted({point.date.year for point in equity_curve})
    rows = []
    for year in years:
        points = [point for point in equity_curve if point.date.year == year]
        if not points:
            continue
        start_equity = points[0].equity
        end_equity = points[-1].equity
        rows.append(
            {
                "year": year,
                "start_equity": start_equity,
                "end_equity": end_equity,
                "return_pct": ((end_equity / start_equity) - 1.0) * 100,
            }
        )
    return rows


def write_trades_csv(trades: list[dict], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(trades[0]))
        writer.writeheader()
        writer.writerows(trades)


def write_summary_json(result, trades: list[dict], yearly: list[dict], path: Path) -> None:
    payload = {
        "methodology": {
            "data_source": "Yahoo Finance chart API adjusted close",
            "period_start": result.equity_curve[0].date.isoformat(),
            "period_end": result.equity_curve[-1].date.isoformat(),
            "execution_assumption": "completed close signal applied to next close-to-close return",
            "costs": "no commission, no slippage",
        },
        "summary": {
            "initial_cash": result.initial_cash,
            "final_equity": result.final_equity,
            "cagr_pct": result.cagr * 100,
            "sharpe": result.sharpe,
            "max_drawdown_pct": result.max_drawdown * 100,
            "tqqq_exposure_pct": result.exposure_tqqq * 100,
            "allocation_changes": max(len(trades) - 1, 0),
            "trade_periods": len(trades),
        },
        "yearly_returns": yearly,
        "trades": trades,
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_markdown(result, trades: list[dict], yearly: list[dict], path: Path) -> None:
    tqqq_trades = [trade for trade in trades if trade["asset"] == "TQQQ"]
    bil_trades = [trade for trade in trades if trade["asset"] == "BIL"]
    winning_tqqq = [trade for trade in tqqq_trades if trade["return_pct"] > 0]
    latest = trades[-1]

    lines = [
        "# TQQQ Regime Switch Backtest",
        "",
        f"Generated: {datetime.now(timezone.utc).date().isoformat()}",
        "",
        "## Method",
        "",
        "- Source skill guidance: `claude-trading-skills/skills/backtest-expert`.",
        "- Data: Yahoo Finance adjusted daily closes for SPY, QQQ, TQQQ, and BIL.",
        f"- Period: {result.equity_curve[0].date.isoformat()} to {result.equity_curve[-1].date.isoformat()}.",
        "- Execution assumption: signal is calculated from completed daily closes and applied to the next close-to-close return.",
        "- Costs: no commissions, no slippage, no taxes.",
        "- Output definition: a trade period is a continuous allocation to either TQQQ or BIL; a new row starts when the target asset changes.",
        "",
        "## Summary",
        "",
        f"- Initial capital: {money(result.initial_cash)}",
        f"- Final equity: {money(result.final_equity)}",
        f"- CAGR: {pct(result.cagr * 100)}",
        f"- Sharpe: {result.sharpe:.2f}",
        f"- Max drawdown: {pct(result.max_drawdown * 100)}",
        f"- TQQQ exposure: {pct(result.exposure_tqqq * 100)}",
        f"- Trade periods: {len(trades)} ({max(len(trades) - 1, 0)} allocation changes)",
        f"- TQQQ periods: {len(tqqq_trades)}; BIL periods: {len(bil_trades)}",
        f"- TQQQ win rate by period: {pct((len(winning_tqqq) / len(tqqq_trades) * 100) if tqqq_trades else 0)}",
        f"- Current/latest target: {latest['asset']} since {latest['start_date']} ({latest['entry_reason']})",
        "",
        "## Yearly Returns",
        "",
        "| Year | Return | End Equity |",
        "|---:|---:|---:|",
    ]
    for row in yearly:
        lines.append(f"| {row['year']} | {pct(row['return_pct'])} | {money(row['end_equity'])} |")

    lines.extend(
        [
            "",
            "## Trade Log",
            "",
            "| # | Start | End | Asset | Trading Days | Return | Entry Reason |",
            "|---:|---|---|---|---:|---:|---|",
        ]
    )
    for trade in trades:
        lines.append(
            "| {trade_number} | {start_date} | {end_date} | {asset} | {holding_trading_days} | {return_pct} | `{entry_reason}` |".format(
                trade_number=trade["trade_number"],
                start_date=trade["start_date"],
                end_date=trade["end_date"],
                asset=trade["asset"],
                holding_trading_days=trade["holding_trading_days"],
                return_pct=pct(trade["return_pct"]),
                entry_reason=trade["entry_reason"],
            )
        )

    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- This is a research backtest, not financial advice or an execution instruction.",
            "- Results will differ from Composer if Composer uses different price data, close/open timing, cash treatment, or indicator conventions.",
            "- The `backtest-expert` guidance recommends adding friction and parameter sensitivity tests before considering live use.",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def pct(value: float) -> str:
    if math.isnan(value):
        return "n/a"
    return f"{value:,.2f}%"


def money(value: float) -> str:
    return f"${value:,.2f}"


if __name__ == "__main__":
    main()
