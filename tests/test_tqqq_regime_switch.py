import unittest

from agentic_trading.strategies.tqqq_regime_switch import DEFENSIVE_ASSET, RISK_ASSET, DecisionInputs, decide


class TqqqRegimeSwitchTests(unittest.TestCase):
    def test_warmup_goes_to_bil(self):
        asset, reason = decide(
            DecisionInputs(
                spy_close=100,
                spy_sma_10=None,
                spy_sma_20=None,
                spy_sma_200=None,
                qqq_rsi_10=None,
                tqqq_rsi_10=None,
            )
        )
        self.assertEqual(asset, DEFENSIVE_ASSET)
        self.assertEqual(reason, "warmup_insufficient_history")

    def test_bear_gate_wins_first(self):
        asset, reason = decide(_inputs(spy_close=99, spy_sma_200=100, tqqq_rsi_10=85, qqq_rsi_10=20))
        self.assertEqual(asset, DEFENSIVE_ASSET)
        self.assertEqual(reason, "bear_gate_spy_below_200_sma")

    def test_confirmed_uptrend_beats_overbought_rule_by_order(self):
        asset, reason = decide(_inputs(spy_close=110, spy_sma_10=105, spy_sma_200=100, tqqq_rsi_10=85))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "confirmed_uptrend_spy_above_200_and_10_above_200")

    def test_overbought_cooldown_when_not_confirmed(self):
        asset, reason = decide(_inputs(spy_close=101, spy_sma_10=99, spy_sma_200=100, tqqq_rsi_10=80))
        self.assertEqual(asset, DEFENSIVE_ASSET)
        self.assertEqual(reason, "overbought_cooldown_tqqq_rsi_10_above_79")

    def test_overbought_threshold_is_strictly_greater_than_79(self):
        asset, reason = decide(_inputs(spy_close=101, spy_sma_10=99, spy_sma_200=100, tqqq_rsi_10=79))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "weak_uptrend_spy_above_20_sma")

    def test_oversold_dip_when_not_overbought(self):
        asset, reason = decide(_inputs(spy_close=101, spy_sma_10=99, spy_sma_200=100, qqq_rsi_10=29))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "oversold_dip_qqq_rsi_10_below_30")

    def test_oversold_threshold_is_strictly_less_than_30(self):
        asset, reason = decide(_inputs(spy_close=101, spy_sma_10=99, spy_sma_200=100, qqq_rsi_10=30))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "weak_uptrend_spy_above_20_sma")

    def test_weak_uptrend_fallback(self):
        asset, reason = decide(_inputs(spy_close=101, spy_sma_10=99, spy_sma_20=100, spy_sma_200=100))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "weak_uptrend_spy_above_20_sma")

    def test_spy_200_day_thresholds_are_strict(self):
        asset, reason = decide(_inputs(spy_close=100, spy_sma_10=101, spy_sma_20=99, spy_sma_200=100))
        self.assertEqual(asset, RISK_ASSET)
        self.assertEqual(reason, "weak_uptrend_spy_above_20_sma")

    def test_chop_default(self):
        asset, reason = decide(_inputs(spy_close=100, spy_sma_10=99, spy_sma_20=101, spy_sma_200=100))
        self.assertEqual(asset, DEFENSIVE_ASSET)
        self.assertEqual(reason, "chop_default")


def _inputs(
    spy_close=101,
    spy_sma_10=99,
    spy_sma_20=100,
    spy_sma_200=100,
    qqq_rsi_10=50,
    tqqq_rsi_10=50,
):
    return DecisionInputs(
        spy_close=spy_close,
        spy_sma_10=spy_sma_10,
        spy_sma_20=spy_sma_20,
        spy_sma_200=spy_sma_200,
        qqq_rsi_10=qqq_rsi_10,
        tqqq_rsi_10=tqqq_rsi_10,
    )


if __name__ == "__main__":
    unittest.main()
