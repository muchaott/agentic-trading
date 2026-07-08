from __future__ import annotations

import html
import math
import sys
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO / "reports" / "tqqq_strategy_1"
PRICE_CSV = OUTPUT_DIR / "TQQQ_strategy_1_price_data.csv"
SVG_OUT = OUTPUT_DIR / "TQQQ_strategy_1_backtest_chart.svg"
HTML_OUT = OUTPUT_DIR / "TQQQ_strategy_1_backtest_chart.html"

sys.path.insert(0, str(REPO / "src"))

from agentic_trading.backtest import run_backtest  # noqa: E402
from agentic_trading.price_data import load_price_csv  # noqa: E402


WIDTH = 1280
HEIGHT = 780
MARGIN_LEFT = 88
MARGIN_RIGHT = 40
MARGIN_TOP = 72
EQUITY_HEIGHT = 430
GAP = 76
DRAWDOWN_HEIGHT = 140


def main() -> None:
    prices = load_price_csv(PRICE_CSV)
    result = run_backtest(prices, initial_cash=100_000)
    dates = sorted(prices)
    strategy = [(point.date, point.equity) for point in result.equity_curve]
    tqqq_bh = buy_and_hold(prices, "TQQQ", 100_000)
    bil_bh = buy_and_hold(prices, "BIL", 100_000)
    strategy_dd = drawdown_series(strategy)
    tqqq_dd = drawdown_series(tqqq_bh)

    svg = render_svg(
        dates=dates,
        strategy=strategy,
        tqqq_bh=tqqq_bh,
        bil_bh=bil_bh,
        strategy_dd=strategy_dd,
        tqqq_dd=tqqq_dd,
        summary={
            "start": strategy[0][0].isoformat(),
            "end": strategy[-1][0].isoformat(),
            "strategy_final": strategy[-1][1],
            "tqqq_final": tqqq_bh[-1][1],
            "bil_final": bil_bh[-1][1],
            "cagr": result.cagr * 100,
            "max_dd": result.max_drawdown * 100,
            "sharpe": result.sharpe,
        },
    )
    SVG_OUT.write_text(svg, encoding="utf-8")
    HTML_OUT.write_text(render_html(svg), encoding="utf-8")


def buy_and_hold(prices, symbol: str, initial_cash: float) -> list[tuple[date, float]]:
    dates = sorted(prices)
    first_close = prices[dates[0]][symbol]
    return [(row_date, initial_cash * prices[row_date][symbol] / first_close) for row_date in dates]


def drawdown_series(series: list[tuple[date, float]]) -> list[tuple[date, float]]:
    peak = series[0][1]
    rows = []
    for row_date, value in series:
        peak = max(peak, value)
        rows.append((row_date, (value / peak - 1.0) * 100))
    return rows


def render_svg(
    dates,
    strategy,
    tqqq_bh,
    bil_bh,
    strategy_dd,
    tqqq_dd,
    summary,
) -> str:
    x0 = MARGIN_LEFT
    x1 = WIDTH - MARGIN_RIGHT
    equity_y0 = MARGIN_TOP
    equity_y1 = MARGIN_TOP + EQUITY_HEIGHT
    dd_y0 = equity_y1 + GAP
    dd_y1 = dd_y0 + DRAWDOWN_HEIGHT

    min_equity = min(value for _, value in [*strategy, *tqqq_bh, *bil_bh])
    max_equity = max(value for _, value in [*strategy, *tqqq_bh, *bil_bh])
    y_min = round_down_log(min_equity)
    y_max = round_up_log(max_equity)

    def x(row_date: date) -> float:
        first = dates[0].toordinal()
        last = dates[-1].toordinal()
        return x0 + ((row_date.toordinal() - first) / (last - first)) * (x1 - x0)

    def y_equity(value: float) -> float:
        return equity_y1 - ((math.log10(value) - math.log10(y_min)) / (math.log10(y_max) - math.log10(y_min))) * (
            equity_y1 - equity_y0
        )

    def y_dd(value: float) -> float:
        min_dd = -80
        max_dd = 0
        return dd_y1 - ((value - min_dd) / (max_dd - min_dd)) * (dd_y1 - dd_y0)

    elements = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="780" viewBox="0 0 1280 780" role="img" aria-labelledby="title desc">',
        "<title id=\"title\">TQQQ Regime Switch Backtest Chart</title>",
        "<desc id=\"desc\">Strategy equity curve, TQQQ and BIL buy-and-hold benchmarks, and drawdown chart.</desc>",
        "<style>",
        "text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:#27313a}",
        ".small{font-size:13px}.axis{stroke:#9aa6b2;stroke-width:1}.grid{stroke:#d8dee6;stroke-width:1}.label{font-size:14px;fill:#5b6773}",
        ".title{font-size:28px;font-weight:700}.subtitle{font-size:14px;fill:#66717c}.legend{font-size:14px;font-weight:600}",
        "</style>",
        '<rect width="1280" height="780" fill="#ffffff"/>',
        '<text x="88" y="38" class="title">TQQQ Regime Switch Backtest</text>',
        f'<text x="88" y="62" class="subtitle">{summary["start"]} to {summary["end"]} · adjusted closes · no costs · next-day close-to-close execution</text>',
        metric_box(780, 22, "Strategy Final", money(summary["strategy_final"]), "#0f766e"),
        metric_box(930, 22, "CAGR", f'{summary["cagr"]:.2f}%', "#0f766e"),
        metric_box(1040, 22, "Max DD", f'{summary["max_dd"]:.2f}%', "#b42318"),
        metric_box(1150, 22, "Sharpe", f'{summary["sharpe"]:.2f}', "#344054"),
    ]

    for tick in log_ticks(y_min, y_max):
        yy = y_equity(tick)
        elements.append(f'<line x1="{x0}" y1="{yy:.2f}" x2="{x1}" y2="{yy:.2f}" class="grid"/>')
        elements.append(f'<text x="{x0 - 10}" y="{yy + 4:.2f}" text-anchor="end" class="small">{money_short(tick)}</text>')

    for year, tick_date in year_ticks(dates):
        xx = x(tick_date)
        elements.append(f'<line x1="{xx:.2f}" y1="{equity_y0}" x2="{xx:.2f}" y2="{dd_y1}" class="grid"/>')
        elements.append(f'<text x="{xx:.2f}" y="{dd_y1 + 28}" text-anchor="middle" class="small">{year}</text>')

    elements.extend(
        [
            f'<line x1="{x0}" y1="{equity_y1}" x2="{x1}" y2="{equity_y1}" class="axis"/>',
            f'<line x1="{x0}" y1="{equity_y0}" x2="{x0}" y2="{equity_y1}" class="axis"/>',
            f'<text x="{x0}" y="{equity_y0 - 18}" class="label">Equity curve, log scale</text>',
            path(strategy, x, y_equity, "#0f766e", 3.2),
            path(tqqq_bh, x, y_equity, "#8b5cf6", 2.1),
            path(bil_bh, x, y_equity, "#64748b", 1.8),
            legend_item(88, equity_y1 + 28, "#0f766e", "Strategy"),
            legend_item(196, equity_y1 + 28, "#8b5cf6", f'TQQQ buy & hold ({money_short(summary["tqqq_final"])})'),
            legend_item(406, equity_y1 + 28, "#64748b", f'BIL buy & hold ({money_short(summary["bil_final"])})'),
        ]
    )

    for tick in [0, -20, -40, -60, -80]:
        yy = y_dd(tick)
        elements.append(f'<line x1="{x0}" y1="{yy:.2f}" x2="{x1}" y2="{yy:.2f}" class="grid"/>')
        elements.append(f'<text x="{x0 - 10}" y="{yy + 4:.2f}" text-anchor="end" class="small">{tick}%</text>')

    elements.extend(
        [
            f'<line x1="{x0}" y1="{dd_y0}" x2="{x0}" y2="{dd_y1}" class="axis"/>',
            f'<line x1="{x0}" y1="{dd_y0}" x2="{x1}" y2="{dd_y0}" class="axis"/>',
            f'<text x="{x0}" y="{dd_y0 - 18}" class="label">Drawdown</text>',
            path(strategy_dd, x, y_dd, "#b42318", 2.5),
            path(tqqq_dd, x, y_dd, "#c084fc", 1.7),
            legend_item(88, dd_y1 + 54, "#b42318", "Strategy drawdown"),
            legend_item(254, dd_y1 + 54, "#c084fc", "TQQQ drawdown"),
        ]
    )

    elements.append("</svg>")
    return "\n".join(elements)


def path(series, x_func, y_func, color: str, width: float) -> str:
    points = [f"{x_func(row_date):.2f},{y_func(value):.2f}" for row_date, value in series]
    return f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>'


def metric_box(x: int, y: int, label: str, value: str, color: str) -> str:
    return (
        f'<text x="{x}" y="{y}" class="small" fill="#66717c">{html.escape(label)}</text>'
        f'<text x="{x}" y="{y + 23}" font-size="20" font-weight="700" fill="{color}">{html.escape(value)}</text>'
    )


def legend_item(x: int, y: int, color: str, label: str) -> str:
    return (
        f'<line x1="{x}" y1="{y - 5}" x2="{x + 28}" y2="{y - 5}" stroke="{color}" stroke-width="4" stroke-linecap="round"/>'
        f'<text x="{x + 38}" y="{y}" class="legend">{html.escape(label)}</text>'
    )


def year_ticks(dates: list[date]) -> list[tuple[int, date]]:
    ticks = []
    seen = set()
    for row_date in dates:
        if row_date.year not in seen:
            seen.add(row_date.year)
            ticks.append((row_date.year, row_date))
    return ticks


def log_ticks(y_min: float, y_max: float) -> list[float]:
    candidates = []
    magnitude = 10 ** math.floor(math.log10(y_min))
    while magnitude <= y_max * 10:
        for multiple in [1, 2, 5]:
            value = multiple * magnitude
            if y_min <= value <= y_max:
                candidates.append(value)
        magnitude *= 10
    return candidates


def round_down_log(value: float) -> float:
    magnitude = 10 ** math.floor(math.log10(value))
    for multiple in [5, 2, 1]:
        candidate = multiple * magnitude
        if candidate <= value:
            return candidate
    return magnitude


def round_up_log(value: float) -> float:
    magnitude = 10 ** math.floor(math.log10(value))
    for multiple in [1, 2, 5, 10]:
        candidate = multiple * magnitude
        if candidate >= value:
            return candidate
    return 10 * magnitude


def money(value: float) -> str:
    return f"${value:,.0f}"


def money_short(value: float) -> str:
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.0f}K"
    return money(value)


def render_html(svg: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TQQQ Regime Switch Backtest Chart</title>
  <style>
    body {{ margin: 0; background: #f5f7fa; color: #27313a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }}
    main {{ max-width: 1320px; margin: 0 auto; padding: 24px; }}
    .frame {{ background: white; border: 1px solid #d8dee6; border-radius: 8px; overflow: auto; box-shadow: 0 12px 30px rgba(16,24,40,.08); }}
    svg {{ display: block; max-width: 100%; height: auto; }}
    p {{ max-width: 960px; line-height: 1.55; }}
  </style>
</head>
<body>
  <main>
    <div class="frame">
{svg}
    </div>
    <p>This chart uses Yahoo Finance adjusted daily closes and the same no-look-ahead convention as the generated backtest report: completed close signals are applied to the next close-to-close return. It excludes commissions, slippage, taxes, and broker execution constraints.</p>
  </main>
</body>
</html>
"""


if __name__ == "__main__":
    main()
