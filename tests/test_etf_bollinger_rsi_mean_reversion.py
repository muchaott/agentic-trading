from datetime import date, timedelta
import unittest

from agentic_trading.strategies.etf_bollinger_rsi_mean_reversion import (
    MeanReversionSettings,
    generate_decisions,
    run_backtest,
)


class EtfBollingerRsiMeanReversionTests(unittest.TestCase):
    def test_generates_bullish_and_bearish_touch_signals(self):
        settings = MeanReversionSettings(bb_period=3, rsi_period=2)
        decisions = generate_decisions("SPY", _ohlc_prices(), settings)

        self.assertEqual(decisions[2].signal, "bullish")
        self.assertEqual(decisions[2].position, 1)
        self.assertEqual(decisions[4].signal, "bearish")
        self.assertEqual(decisions[4].position, 0)

    def test_long_short_mode_flips_bearish_signal_short(self):
        settings = MeanReversionSettings(bb_period=3, rsi_period=2, position_mode="long_short")
        decisions = generate_decisions("SPY", _ohlc_prices(), settings)

        self.assertEqual(decisions[4].signal, "bearish")
        self.assertEqual(decisions[4].position, -1)

    def test_backtest_runs_one_etf_strategy_instance(self):
        settings = MeanReversionSettings(bb_period=3, rsi_period=2)
        result = run_backtest("SPY", _ohlc_prices(), initial_cash=1000, settings=settings)

        self.assertEqual(result.symbol, "SPY")
        self.assertGreater(result.trades, 0)
        self.assertEqual(result.equity_curve[0].equity, 1000)
        self.assertEqual(len(result.decisions), len(result.equity_curve))


def _ohlc_prices():
    start = date(2024, 1, 1)
    closes = [100, 100, 90, 100, 110, 108]
    lows = [99, 99, 86, 98, 108, 106]
    highs = [101, 101, 92, 102, 117, 110]
    prices = {}
    for index, close in enumerate(closes):
        prices[start + timedelta(days=index)] = {
            "open": close,
            "high": highs[index],
            "low": lows[index],
            "close": close,
        }
    return prices


if __name__ == "__main__":
    unittest.main()
