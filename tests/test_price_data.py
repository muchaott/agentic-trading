from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from agentic_trading.price_data import load_price_csv


class PriceDataTests(unittest.TestCase):
    def test_loads_wide_csv(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "prices.csv"
            path.write_text("date,SPY,QQQ,TQQQ,BIL\n2024-01-02,1,2,3,4\n", encoding="utf-8")

            table = load_price_csv(path)

        self.assertEqual(table[next(iter(table))]["TQQQ"], 3.0)

    def test_loads_long_csv(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "prices.csv"
            path.write_text(
                "date,symbol,close\n2024-01-02,SPY,1\n2024-01-02,TQQQ,3\n",
                encoding="utf-8",
            )

            table = load_price_csv(path)

        self.assertEqual(table[next(iter(table))]["SPY"], 1.0)


if __name__ == "__main__":
    unittest.main()
