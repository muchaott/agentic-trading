from __future__ import annotations

import csv
import json
import math
import sys
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "src"))

from agentic_trading.backtest import run_backtest  # noqa: E402
from agentic_trading.price_data import load_price_csv  # noqa: E402
from agentic_trading.strategies.tqqq_regime_switch import generate_decisions  # noqa: E402

SOURCE_DIR = REPO / "reports" / "tqqq_strategy_1"
OUTPUT_DIR = REPO / "reports" / "tqqq_strategy_1_cash_variant"
PRICE_CSV = SOURCE_DIR / "TQQQ_strategy_1_price_data.csv"
ORIGINAL_SUMMARY = SOURCE_DIR / "TQQQ_strategy_1_backtest_summary.json"
INITIAL_CASH = 100_000.0
TRADING_DAYS = 252


@dataclass(frozen=True)
class EquityPoint:
    date: date
    equity: float
    target_asset: str
    reason: str
    daily_return: float


@dataclass(frozen=True)
class CashVariantResult:
    initial_cash: float
    final_equity: float
    cagr: float
    sharpe: float
    max_drawdown: float
    tqqq_exposure: float
    allocation_changes: int
    equity_curve: list[EquityPoint]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    prices = load_price_csv(PRICE_CSV)
    original = json.loads(ORIGINAL_SUMMARY.read_text(encoding="utf-8"))
    original_result = run_backtest(prices, initial_cash=INITIAL_CASH)
    cash_result = run_cash_variant(prices)
    trades = build_trade_periods(cash_result.equity_curve)
    yearly = build_yearly_returns(cash_result.equity_curve)

    write_trades_csv(trades, OUTPUT_DIR / "TQQQ_strategy_1_cash_variant_trade_log.csv")
    write_summary_json(
        cash_result,
        original["summary"],
        trades,
        yearly,
        OUTPUT_DIR / "TQQQ_strategy_1_cash_variant_summary.json",
    )
    write_markdown(
        cash_result,
        original["summary"],
        trades,
        yearly,
        OUTPUT_DIR / "TQQQ_strategy_1_cash_variant_report.md",
    )
    write_svg(
        original_result.equity_curve,
        cash_result.equity_curve,
        OUTPUT_DIR / "TQQQ_strategy_1_cash_variant_chart.svg",
    )
    write_readme(cash_result, original["summary"], OUTPUT_DIR / "README.md")


def run_cash_variant(prices) -> CashVariantResult:
    decisions = generate_decisions(prices)
    dates = sorted(prices)
    decision_by_date = {decision.date: decision for decision in decisions}
    equity = INITIAL_CASH
    peak = INITIAL_CASH
    max_drawdown = 0.0
    returns: list[float] = []
    tqqq_days = 0
    allocation_changes = 0
    first_decision = decision_by_date[dates[0]]
    previous_asset = mapped_asset(first_decision.target_asset)
    curve = [EquityPoint(dates[0], equity, previous_asset, map_reason(first_decision.reason), 0.0)]

    for index in range(1, len(dates)):
        previous_date = dates[index - 1]
        current_date = dates[index]
        prior_decision = decision_by_date[previous_date]
        asset = mapped_asset(prior_decision.target_asset)
        if asset != previous_asset:
            allocation_changes += 1
            previous_asset = asset

        if asset == "TQQQ":
            daily_return = (prices[current_date]["TQQQ"] / prices[previous_date]["TQQQ"]) - 1.0
            tqqq_days += 1
        else:
            daily_return = 0.0

        returns.append(daily_return)
        equity *= 1.0 + daily_return
        peak = max(peak, equity)
        max_drawdown = min(max_drawdown, (equity / peak) - 1.0)
        curve.append(EquityPoint(current_date, equity, asset, map_reason(prior_decision.reason), daily_return))

    years = len(returns) / TRADING_DAYS
    cagr = (equity / INITIAL_CASH) ** (1.0 / years) - 1.0
    return CashVariantResult(
        initial_cash=INITIAL_CASH,
        final_equity=equity,
        cagr=cagr,
        sharpe=annualized_sharpe(returns),
        max_drawdown=max_drawdown,
        tqqq_exposure=tqqq_days / len(returns),
        allocation_changes=allocation_changes,
        equity_curve=curve,
    )


def mapped_asset(asset: str) -> str:
    return "CASH" if asset == "BIL" else asset


def map_reason(reason: str) -> str:
    if reason in {"warmup_insufficient_history", "bear_gate_spy_below_200_sma", "overbought_cooldown_tqqq_rsi_10_above_79", "chop_default"}:
        return f"{reason}_to_cash"
    return reason


def annualized_sharpe(returns: list[float]) -> float:
    if len(returns) < 2:
        return 0.0
    mean = sum(returns) / len(returns)
    variance = sum((value - mean) ** 2 for value in returns) / (len(returns) - 1)
    if variance == 0:
        return 0.0
    return (mean / math.sqrt(variance)) * math.sqrt(TRADING_DAYS)


def build_trade_periods(curve: list[EquityPoint]) -> list[dict]:
    periods: list[dict] = []
    start_index = 0
    current_asset = curve[0].target_asset
    current_reason = curve[0].reason

    for index in range(1, len(curve)):
        asset = curve[index].target_asset
        reason = curve[index].reason
        if asset != current_asset:
            periods.append(make_period(curve, start_index, index - 1, current_asset, current_reason))
            start_index = index - 1
            current_asset = asset
            current_reason = reason

    periods.append(make_period(curve, start_index, len(curve) - 1, current_asset, current_reason))
    for number, period in enumerate(periods, start=1):
        period["trade_number"] = number
    return periods


def make_period(curve: list[EquityPoint], start_index: int, end_index: int, asset: str, reason: str) -> dict:
    start = curve[start_index]
    end = curve[end_index]
    return {
        "trade_number": 0,
        "start_date": start.date.isoformat(),
        "end_date": end.date.isoformat(),
        "asset": asset,
        "entry_reason": reason,
        "holding_trading_days": end_index - start_index,
        "entry_equity": start.equity,
        "exit_equity": end.equity,
        "return_pct": ((end.equity / start.equity) - 1.0) * 100,
    }


def build_yearly_returns(curve: list[EquityPoint]) -> list[dict]:
    rows = []
    for year in sorted({point.date.year for point in curve}):
        points = [point for point in curve if point.date.year == year]
        rows.append(
            {
                "year": year,
                "start_equity": points[0].equity,
                "end_equity": points[-1].equity,
                "return_pct": ((points[-1].equity / points[0].equity) - 1.0) * 100,
            }
        )
    return rows


def write_trades_csv(trades: list[dict], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(trades[0]))
        writer.writeheader()
        writer.writerows(trades)


def write_summary_json(result: CashVariantResult, original: dict, trades: list[dict], yearly: list[dict], path: Path) -> None:
    payload = {
        "methodology": {
            "variant": "Replace BIL allocations with cash earning 0% daily return",
            "source_price_data": str(PRICE_CSV.relative_to(REPO)),
            "period_start": result.equity_curve[0].date.isoformat(),
            "period_end": result.equity_curve[-1].date.isoformat(),
            "execution_assumption": "completed close signal applied to next close-to-close return",
            "costs": "no commission, no slippage, no taxes",
        },
        "summary": summary_payload(result, trades),
        "comparison_to_bil_strategy_1": comparison_payload(result, original),
        "yearly_returns": yearly,
        "trades": trades,
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_markdown(result: CashVariantResult, original: dict, trades: list[dict], yearly: list[dict], path: Path) -> None:
    summary = summary_payload(result, trades)
    comparison = comparison_payload(result, original)
    lines = [
        "# TQQQ Strategy 1 Cash Variant Backtest",
        "",
        f"Generated: {datetime.now(timezone.utc).date().isoformat()}",
        "",
        "## Question",
        "",
        "What happens if Strategy 1 replaces every BIL allocation with cash?",
        "",
        "## Method",
        "",
        "- Same Strategy 1 signal tree.",
        "- Same saved Yahoo Finance adjusted close data as Strategy 1.",
        "- When the original strategy targets `BIL`, this variant targets `CASH` instead.",
        "- Cash earns exactly `0.00%` per day.",
        "- No commissions, no slippage, no taxes.",
        "- Signal timing remains completed close signal applied to next close-to-close return.",
        "",
        "## Result",
        "",
        f"- Final equity: {money(summary['final_equity'])}",
        f"- CAGR: {pct(summary['cagr_pct'])}",
        f"- Sharpe: {summary['sharpe']:.2f}",
        f"- Max drawdown: {pct(summary['max_drawdown_pct'])}",
        f"- TQQQ exposure: {pct(summary['tqqq_exposure_pct'])}",
        f"- Trade periods: {summary['trade_periods']} ({summary['allocation_changes']} allocation changes)",
        "",
        "## Comparison vs Strategy 1 with BIL",
        "",
        "| Metric | Strategy 1: BIL | Cash Variant | Difference |",
        "|---|---:|---:|---:|",
        f"| Final equity | {money(original['final_equity'])} | {money(summary['final_equity'])} | {money(comparison['final_equity_delta'])} |",
        f"| CAGR | {pct(original['cagr_pct'])} | {pct(summary['cagr_pct'])} | {pct(comparison['cagr_delta_pct_points'])} pts |",
        f"| Sharpe | {original['sharpe']:.2f} | {summary['sharpe']:.2f} | {comparison['sharpe_delta']:.2f} |",
        f"| Max drawdown | {pct(original['max_drawdown_pct'])} | {pct(summary['max_drawdown_pct'])} | {pct(comparison['max_drawdown_delta_pct_points'])} pts |",
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
            f"| {trade['trade_number']} | {trade['start_date']} | {trade['end_date']} | {trade['asset']} | "
            f"{trade['holding_trading_days']} | {pct(trade['return_pct'])} | `{trade['entry_reason']}` |"
        )

    lines.extend(
        [
            "",
            "## Takeaway",
            "",
            "Replacing BIL with cash slightly lowers return and Sharpe over this sample because BIL contributed positive yield during defensive windows. Drawdown is effectively unchanged because the deepest losses came from TQQQ exposure around regime transitions, not from the defensive asset.",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_readme(result: CashVariantResult, original: dict, path: Path) -> None:
    comparison = comparison_payload(result, original)
    text = f"""# TQQQ Strategy 1 Cash Variant

Backtest variant that replaces Strategy 1's `BIL` allocations with `CASH`.

## Snapshot

- Period: {result.equity_curve[0].date.isoformat()} to {result.equity_curve[-1].date.isoformat()}
- Cash return: 0.00% daily
- Final equity: {money(result.final_equity)}
- CAGR: {pct(result.cagr * 100)}
- Sharpe: {result.sharpe:.2f}
- Max drawdown: {pct(result.max_drawdown * 100)}
- Difference vs Strategy 1 with BIL: {money(comparison['final_equity_delta'])}

## Files

- `TQQQ_strategy_1_cash_variant_report.md`
- `TQQQ_strategy_1_cash_variant_summary.json`
- `TQQQ_strategy_1_cash_variant_trade_log.csv`
- `TQQQ_strategy_1_cash_variant_chart.svg`
"""
    path.write_text(text, encoding="utf-8")


def write_svg(original_curve, cash_curve: list[EquityPoint], path: Path) -> None:
    width = 1200
    height = 640
    left = 86
    right = 34
    top = 66
    bottom = 72
    x0 = left
    x1 = width - right
    y0 = top
    y1 = height - bottom
    dates = [point.date for point in cash_curve]
    values = [point.equity for point in cash_curve] + [point.equity for point in original_curve]
    y_min = 90_000
    y_max = max(values) * 1.08

    def x(row_date: date) -> float:
        return x0 + ((row_date.toordinal() - dates[0].toordinal()) / (dates[-1].toordinal() - dates[0].toordinal())) * (x1 - x0)

    def y(value: float) -> float:
        return y1 - ((math.log10(value) - math.log10(y_min)) / (math.log10(y_max) - math.log10(y_min))) * (y1 - y0)

    def path_points(series) -> str:
        return " ".join(f"{x(point.date):.2f},{y(point.equity):.2f}" for point in series)

    grid = []
    for value in [100_000, 200_000, 500_000, 1_000_000, 1_500_000, 2_000_000]:
        if value <= y_max:
            yy = y(value)
            grid.append(f'<line x1="{x0}" y1="{yy:.2f}" x2="{x1}" y2="{yy:.2f}" class="grid"/>')
            grid.append(f'<text x="{x0 - 10}" y="{yy + 4:.2f}" text-anchor="end" class="small">{money_short(value)}</text>')

    for year in range(dates[0].year, dates[-1].year + 1):
        tick = next((row_date for row_date in dates if row_date.year == year), None)
        if tick:
            xx = x(tick)
            grid.append(f'<line x1="{xx:.2f}" y1="{y0}" x2="{xx:.2f}" y2="{y1}" class="grid"/>')
            grid.append(f'<text x="{xx:.2f}" y="{height - 34}" text-anchor="middle" class="small">{year}</text>')

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<style>
text{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:#27313a}}
.title{{font-size:26px;font-weight:700}}.small{{font-size:13px;fill:#5b6773}}.grid{{stroke:#d8dee6;stroke-width:1}}.axis{{stroke:#9aa6b2;stroke-width:1}}
</style>
<rect width="{width}" height="{height}" fill="#fff"/>
<text x="{left}" y="36" class="title">TQQQ Strategy 1: BIL vs Cash Defensive Sleeve</text>
<text x="{left}" y="58" class="small">{dates[0].isoformat()} to {dates[-1].isoformat()} · log equity scale · no costs</text>
{''.join(grid)}
<line x1="{x0}" y1="{y1}" x2="{x1}" y2="{y1}" class="axis"/>
<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1}" class="axis"/>
<polyline points="{path_points(original_curve)}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
<polyline points="{path_points(cash_curve)}" fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
<line x1="{left}" y1="{height - 18}" x2="{left + 28}" y2="{height - 18}" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>
<text x="{left + 38}" y="{height - 14}" class="small">Strategy 1 with BIL</text>
<line x1="{left + 210}" y1="{height - 18}" x2="{left + 238}" y2="{height - 18}" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
<text x="{left + 248}" y="{height - 14}" class="small">Cash variant</text>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def summary_payload(result: CashVariantResult, trades: list[dict]) -> dict:
    return {
        "initial_cash": result.initial_cash,
        "final_equity": result.final_equity,
        "cagr_pct": result.cagr * 100,
        "sharpe": result.sharpe,
        "max_drawdown_pct": result.max_drawdown * 100,
        "tqqq_exposure_pct": result.tqqq_exposure * 100,
        "allocation_changes": result.allocation_changes,
        "trade_periods": len(trades),
    }


def comparison_payload(result: CashVariantResult, original: dict) -> dict:
    return {
        "final_equity_delta": result.final_equity - original["final_equity"],
        "cagr_delta_pct_points": (result.cagr * 100) - original["cagr_pct"],
        "sharpe_delta": result.sharpe - original["sharpe"],
        "max_drawdown_delta_pct_points": (result.max_drawdown * 100) - original["max_drawdown_pct"],
    }


def pct(value: float) -> str:
    return f"{value:,.2f}%"


def money(value: float) -> str:
    return f"${value:,.2f}"


def money_short(value: float) -> str:
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.0f}K"
    return f"${value:,.0f}"


if __name__ == "__main__":
    main()
