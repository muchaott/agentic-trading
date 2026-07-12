import unittest

from agentic_trading.indicators import bollinger_bands, rsi_wilder, sma


class IndicatorTests(unittest.TestCase):
    def test_sma_aligns_with_input(self):
        self.assertEqual(sma([1, 2, 3, 4], 3), [None, None, 2.0, 3.0])

    def test_rsi_returns_100_when_no_losses(self):
        values = list(range(1, 14))
        result = rsi_wilder(values, 10)
        self.assertIsNone(result[9])
        self.assertEqual(result[10], 100.0)

    def test_bollinger_bands_align_with_input(self):
        result = bollinger_bands([1, 2, 3, 4], period=3, deviations=2)
        self.assertIsNone(result[1])
        lower, middle, upper = result[2]

        self.assertAlmostEqual(middle, 2.0)
        self.assertAlmostEqual(lower, 0.3670068381)
        self.assertAlmostEqual(upper, 3.6329931619)


if __name__ == "__main__":
    unittest.main()
