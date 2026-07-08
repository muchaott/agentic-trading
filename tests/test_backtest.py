from datetime import date, timedelta
import unittest

from agentic_trading.backtest import run_backtest
from agentic_trading.strategies.tqqq_regime_switch import latest_decision


class BacktestTests(unittest.TestCase):
    def test_runs_on_synthetic_prices(self):
        prices = _synthetic_prices(days=230)
        decision = latest_decision(prices)
        result = run_backtest(prices, initial_cash=1000)

        self.assertEqual(decision.target_asset, "TQQQ")
        self.assertGreater(result.final_equity, 1000)
        self.assertGreater(result.exposure_tqqq, 0)
        self.assertEqual(result.equity_curve[0].equity, 1000)


def _synthetic_prices(days: int):
    start = date(2020, 1, 1)
    prices = {}
    for index in range(days):
        row_date = start + timedelta(days=index)
        spy = 100 + index
        qqq = 100 + (index * 1.2)
        tqqq = 100 + (index * 3.0)
        bil = 100 + (index * 0.01)
        prices[row_date] = {"SPY": spy, "QQQ": qqq, "TQQQ": tqqq, "BIL": bil}
    return prices


if __name__ == "__main__":
    unittest.main()
