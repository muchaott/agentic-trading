"use client";

import { useEffect, useMemo, useState } from "react";

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

type SymbolKey = "SPY" | "QQQ" | "TQQQ" | "BIL" | "SMH" | "SOXL";
type StrategyId = "S1" | "A" | "B" | "C";
type Position = "BIL" | "TQQQ" | "SOXL" | "CASH";
type ChartView = "equity" | "drawdown" | "cohort";
type ChartRange = "all" | "10y" | "5y" | "3y" | "1y";

type StrategyPoint = {
  date: string;
  equity: number;
  drawdown: number;
  position: Position;
  reason: string;
  exposure: boolean;
};

type ClosedTrade = {
  entryDate: string;
  exitDate: string;
  asset: "SOXL";
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  days: number;
  reason: string;
};

type StrategyStats = {
  cagr: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpe: number;
  trades: number;
  exposure: number;
  finalEquity: number;
  testedYears: number;
  startDate: string;
  endDate: string;
  winRate: number | null;
};

type EntryCohort = {
  startDate: string;
  troughDate: string;
  recoveryDate: string | null;
  minLoss: number;
  finalReturn: number;
  cagr: number;
  tradingDaysToTrough: number;
  tradingDaysToRecovery: number | null;
  calendarDaysToRecovery: number | null;
  startIndex: number;
};

type EntryStressTest = {
  cohorts: EntryCohort[];
  worstByLoss: EntryCohort | null;
  slowestRecovery: EntryCohort | null;
  medianRecoveryDays: number | null;
  p90RecoveryDays: number | null;
  unrecoveredCount: number;
  observedStartCount: number;
  minFollowThroughDays: number;
  verdict: string;
  tone: "positive" | "warning" | "danger" | "neutral";
};

type ChartPoint = StrategyPoint & {
  value: number;
};

type StrategyRun = {
  id: StrategyId;
  title: string;
  label: string;
  subtitle: string;
  plainEnglish: string;
  riskProfile: string;
  symbols: string[];
  rules: string[];
  exits: string[];
  caveat: string;
  points: StrategyPoint[];
  stats: StrategyStats;
  currentAllocation: string;
  latestReason: string;
  trades: ClosedTrade[];
  entryStress: EntryStressTest;
};

type Strategy2SweepRow = {
  bucket: string;
  name: string;
  description: string;
  annualizedIrr: number;
  maxDrawdown: number;
  finalEquity: number;
  moneyMultiple: number;
  totalContributions: number;
  endingTqqqWeight: number;
  actionCounts: Array<[string, number]>;
  rules: string[];
};

type HistoryMap = Partial<Record<SymbolKey, Bar[]>>;
type CompleteHistoryMap = Record<SymbolKey, Bar[]>;

const REQUIRED_SYMBOLS: SymbolKey[] = ["SPY", "QQQ", "TQQQ", "BIL", "SMH", "SOXL"];
const INITIAL_CASH = 100000;
const DEFAULT_COST_BPS = 0;
const MIN_ENTRY_FOLLOW_THROUGH_DAYS = 252;
const CHART_VIEW_OPTIONS: Array<{ value: ChartView; label: string }> = [
  { value: "equity", label: "Equity" },
  { value: "drawdown", label: "Drawdown" },
  { value: "cohort", label: "Worst start path" },
];
const CHART_RANGE_OPTIONS: Array<{ value: ChartRange; label: string }> = [
  { value: "all", label: "All" },
  { value: "10y", label: "10Y" },
  { value: "5y", label: "5Y" },
  { value: "3y", label: "3Y" },
  { value: "1y", label: "1Y" },
];
const RANGE_TO_TRADING_DAYS: Record<Exclude<ChartRange, "all">, number> = {
  "10y": 2520,
  "5y": 1260,
  "3y": 756,
  "1y": 252,
};
const STRATEGY_ORDER: StrategyId[] = ["S1", "A", "B", "C"];

const STRATEGY_2_SWEEP = {
  generatedAt: "2026-07-13T22:25:27Z",
  period: "2010-04-01 to 2026-07-01",
  months: 196,
  metricNote: "Monthly-contribution tests use annualized IRR, not lump-sum CAGR.",
  champions: [
    {
      bucket: "Max IRR",
      name: "cagr_grabber_t40_h10_dd20_v35",
      description: "Higher persistent TQQQ target with 10% high-valuation cap.",
      annualizedIrr: 0.24678792933720994,
      maxDrawdown: -0.4332872842919604,
      finalEquity: 19895978.01902479,
      moneyMultiple: 9.565374047608072,
      totalContributions: 2080000,
      endingTqqqWeight: 0.11942047989347097,
      actionCounts: [["High valuation", 134], ["Minor bottom", 12], ["Normal", 13], ["Overheat trim", 37]],
      rules: [
        "Normal regime target: 40% TQQQ.",
        "High-valuation target: cap TQQQ at 10%.",
        "Bottom deployment: 25% TQQQ on minor bottoms and 80% on major bottoms.",
        "Stress override: deploy 65% TQQQ when drawdown is at least -20% and VIX is 35 or higher.",
        "Reserve asset is BIL; overheat trims 8.33% per signal and keeps 10% in cash.",
      ],
    },
    {
      bucket: "Best under -35% DD",
      name: "ladder_t100_h050_oh00_dd25_v30",
      description: "TQQQ satellite ladder with limited high-valuation exposure and drawdown/VIX stress deployment.",
      annualizedIrr: 0.21316336688728899,
      maxDrawdown: -0.34160459951183864,
      finalEquity: 14337636.93483883,
      moneyMultiple: 6.893094680210976,
      totalContributions: 2080000,
      endingTqqqWeight: 0.06101436811588035,
      actionCounts: [["High valuation", 134], ["Minor bottom", 11], ["Normal", 13], ["Overheat trim", 37], ["Stress override", 1]],
      rules: [
        "Normal regime target: 10% TQQQ.",
        "High-valuation target: cap TQQQ at 5%.",
        "Bottom deployment: 10% TQQQ on minor bottoms and 80% on major bottoms.",
        "Stress override: deploy 35% TQQQ when drawdown is at least -25% and VIX is 30 or higher.",
        "Reserve asset is BIL; trims rotate exposure back toward reserve rather than forcing cash.",
      ],
    },
    {
      bucket: "Best under -40% DD",
      name: "ladder_t250_h100_oh00_dd25_v30",
      description: "A higher-return ladder that accepts a deeper drawdown budget than the QQQ-like variant.",
      annualizedIrr: 0.2316667056731021,
      maxDrawdown: -0.393440134028437,
      finalEquity: 17166444.957491178,
      moneyMultiple: 8.253098537255374,
      totalContributions: 2080000,
      endingTqqqWeight: 0.10866333706235783,
      actionCounts: [["High valuation", 134], ["Minor bottom", 11], ["Normal", 13], ["Overheat trim", 37], ["Stress override", 1]],
      rules: [
        "Normal regime target: 25% TQQQ.",
        "High-valuation target: cap TQQQ at 10%.",
        "Bottom deployment: 20% TQQQ on minor bottoms and 80% on major bottoms.",
        "Stress override: deploy 50% TQQQ when drawdown is at least -25% and VIX is 30 or higher.",
        "Reserve asset is BIL; same trim cadence as the lower-drawdown ladder.",
      ],
    },
    {
      bucket: "Best QQQ-like DD",
      name: "ladder_t100_h050_oh00_dd25_v30",
      description: "Same configuration as the best under -35% drawdown bucket; it is the cleanest QQQ-like drawdown champion in this sweep.",
      annualizedIrr: 0.21316336688728899,
      maxDrawdown: -0.34160459951183864,
      finalEquity: 14337636.93483883,
      moneyMultiple: 6.893094680210976,
      totalContributions: 2080000,
      endingTqqqWeight: 0.06101436811588035,
      actionCounts: [["High valuation", 134], ["Minor bottom", 11], ["Normal", 13], ["Overheat trim", 37], ["Stress override", 1]],
      rules: [
        "Use the same ladder_t100_h050_oh00_dd25_v30 configuration.",
        "Its -34.16% max drawdown is close to QQQ DCA's -31.95% drawdown in the same monthly-contribution study.",
        "It outperformed QQQ DCA on annualized IRR in the sweep: 21.32% versus 19.90%.",
      ],
    },
  ] satisfies Strategy2SweepRow[],
  baselines: [
    {
      bucket: "QQQ DCA",
      name: "QQQ DCA",
      description: "Monthly contribution baseline into QQQ.",
      annualizedIrr: 0.1989545438121041,
      maxDrawdown: -0.3195069085006923,
      finalEquity: 12240333.604621261,
      moneyMultiple: 6.245068165623093,
      totalContributions: 1960000,
      endingTqqqWeight: 0,
      actionCounts: [],
      rules: ["Buy QQQ with monthly contributions and hold through the sweep window."],
    },
    {
      bucket: "TQQQ DCA",
      name: "TQQQ DCA",
      description: "Monthly contribution baseline into TQQQ.",
      annualizedIrr: 0.4211838595997208,
      maxDrawdown: -0.8000757718520393,
      finalEquity: 107523547.58935538,
      moneyMultiple: 54.858952851711926,
      totalContributions: 1960000,
      endingTqqqWeight: 0,
      actionCounts: [],
      rules: ["Buy TQQQ with monthly contributions and hold through the sweep window."],
    },
  ] satisfies Strategy2SweepRow[],
};

const STRATEGY_COPY: Record<StrategyId, Omit<StrategyRun, "points" | "stats" | "currentAllocation" | "latestReason" | "trades" | "entryStress">> = {
  S1: {
    id: "S1",
    title: "TQQQ Strategy 1 - Regime Switch",
    label: "Strategy 1",
    subtitle: "Imported TQQQ/BIL regime switch from the saved research package",
    plainEnglish:
      "Use SPY as the market regime filter. Own TQQQ when the broad-market trend is constructive, and rotate to BIL during warmup periods, failed long-term trend, or weak tape.",
    riskProfile: "Aggressive leveraged Nasdaq exposure with Treasury-bill risk-off sleeve",
    symbols: ["SPY", "TQQQ", "BIL"],
    rules: [
      "Hold BIL while the 200-day trend history warms up.",
      "Hold BIL when SPY closes below its 200-day moving average.",
      "Own TQQQ when SPY closes above its 200-day average and the SPY 10-day average is above the 200-day average.",
      "Own TQQQ in a weaker but still constructive tape when SPY closes above its 20-day average.",
      "Otherwise hold BIL until the broad-market setup improves.",
    ],
    exits: [
      "Exit TQQQ to BIL when SPY falls below its 200-day moving average.",
      "Exit TQQQ to BIL when SPY no longer clears either the confirmed trend or weak-uptrend gate.",
      "Switches are applied after completed daily closes to the next close-to-close return.",
    ],
    caveat:
      "Saved package snapshot: 2016-07-08 to 2026-07-07, $100,000 to $1,530,846, 31.50% CAGR, 0.82 Sharpe, -58.41% max drawdown, and 52 trade periods before friction, taxes, or slippage. The live tool recomputes from available full-history data, so the current numbers can differ.",
  },
  A: {
    id: "A",
    title: "TQQQ Nasdaq Regime Cooldown",
    label: "Candidate A",
    subtitle: "High-growth Nasdaq sleeve with SPY and QQQ safety gates",
    plainEnglish:
      "Own TQQQ only when the broad market and Nasdaq trend are healthy. Step aside to BIL when the market breaks trend, volatility is too hot, or TQQQ looks overextended.",
    riskProfile: "Aggressive growth, moderated by regime filters",
    symbols: ["SPY", "QQQ", "TQQQ", "BIL"],
    rules: [
      "Hold BIL while indicators warm up.",
      "Hold BIL when SPY is below its 200-day average.",
      "Hold BIL when QQQ is below its 180-day average.",
      "Hold BIL when TQQQ RSI(10) is above 79, then cool down for 3 sessions.",
      "Hold BIL when QQQ 20-day realized volatility is above 35%.",
      "Own TQQQ when SPY and QQQ trend confirmation is positive.",
      "Own TQQQ on a QQQ oversold bounce if QQQ is still above its 180-day average.",
      "Otherwise own TQQQ only when SPY is above its 20-day average.",
    ],
    exits: [
      "Exit to BIL on any failed trend gate.",
      "Exit to BIL on overbought TQQQ RSI and respect the cooldown.",
      "Exit to BIL during high-volatility Nasdaq regimes.",
    ],
    caveat:
      "This is not pure mean reversion. It is a leveraged regime strategy that uses mean-reversion entries only inside a healthy Nasdaq tape.",
  },
  B: {
    id: "B",
    title: "SOXL Semiconductor Regime Cooldown",
    label: "Candidate B",
    subtitle: "Semiconductor beta with SMH trend and volatility controls",
    plainEnglish:
      "Use SMH as the cleaner semiconductor signal and SOXL as the high-octane execution sleeve. Move to BIL when semiconductors or the broad market lose trend.",
    riskProfile: "Very aggressive sector leverage",
    symbols: ["SPY", "SMH", "SOXL", "BIL"],
    rules: [
      "Hold BIL while indicators warm up.",
      "Hold BIL when SPY is below its 200-day average.",
      "Hold BIL when SMH is below its 200-day average.",
      "Hold BIL when SOXL RSI(10) is above 79, then cool down for 2 sessions.",
      "Hold BIL when SMH 20-day realized volatility is above 40%.",
      "Own SOXL when SMH 20-day average is above its 200-day average.",
      "Own SOXL on a SMH oversold bounce if SMH remains above its 200-day average.",
      "Otherwise own SOXL only when SMH closes above its 20-day average.",
    ],
    exits: [
      "Exit to BIL on failed SPY or SMH trend gates.",
      "Exit to BIL when SOXL becomes overbought and wait through the cooldown.",
      "Exit to BIL during high-volatility semiconductor regimes.",
    ],
    caveat:
      "The return engine is powerful because SOXL is powerful. The drawdowns can still be severe, so this belongs in the high-return and high-pain bucket.",
  },
  C: {
    id: "C",
    title: "SOXL/SMH Explicit Mean-Reversion Exit",
    label: "Candidate C",
    subtitle: "Lower-exposure bounce trades with ATR targets, stops, and time exits",
    plainEnglish:
      "Wait for SMH to wash out below its lower Bollinger Band while its long-term trend is intact. Enter SOXL the next open, then exit by target, stop, mean reversion, or time.",
    riskProfile: "Selective mean reversion with defined exits",
    symbols: ["SMH", "SOXL"],
    rules: [
      "Use SMH Bollinger Bands(20, 2.0), RSI(14), and the SMH 200-day average.",
      "Enter SOXL next open when SMH touches the lower band, RSI(14) is 40 or lower, and SMH is above its 200-day average.",
      "Size the test as fully invested when a trade is active and cash otherwise.",
      "Stay out while indicators are warming up or the SMH long-term trend is broken.",
    ],
    exits: [
      "Take profit at entry plus 2.0 x SOXL ATR(14).",
      "Stop out at entry minus 1.5 x SOXL ATR(14).",
      "Exit next open when SMH reaches its middle Bollinger Band or RSI(14) reaches 50.",
      "Exit after 20 trading days if the bounce does not resolve.",
      "When both stop and target are inside the same daily bar, assume the stop hits first.",
    ],
    caveat:
      "This is the most faithful mean-reversion design, but it may lag A and B because it spends much more time in cash.",
  },
};

export default function Home() {
  const [histories, setHistories] = useState<HistoryMap>({});
  const [selectedId, setSelectedId] = useState<StrategyId>("S1");
  const [status, setStatus] = useState("Loading full-history market data");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialCash, setInitialCash] = useState(INITIAL_CASH);
  const [costBps, setCostBps] = useState(DEFAULT_COST_BPS);
  const [chartView, setChartView] = useState<ChartView>("equity");
  const [chartRange, setChartRange] = useState<ChartRange>("all");
  const [selectedCohortStart, setSelectedCohortStart] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadHistories(controller.signal);
    return () => controller.abort();
  }, []);

  const completeHistories = useMemo(
    () => (hasCompleteHistories(histories) ? histories : null),
    [histories],
  );

  const runs = useMemo(
    () => (completeHistories ? buildStrategyRuns(completeHistories, initialCash, costBps) : []),
    [completeHistories, initialCash, costBps],
  );

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedId) ?? runs[0] ?? null,
    [runs, selectedId],
  );

  const bestCagr = useMemo(
    () => maxBy(runs, (run) => run.stats.cagr),
    [runs],
  );

  const bestDrawdown = useMemo(
    () => maxBy(runs, (run) => run.stats.maxDrawdown),
    [runs],
  );

  const newestDate = useMemo(() => {
    const dates = REQUIRED_SYMBOLS.flatMap((symbol) => histories[symbol]?.at(-1)?.date ?? []);
    return dates.sort().at(-1) ?? "latest close";
  }, [histories]);

  const selectedCohort = useMemo(() => {
    if (!selectedRun) return null;
    return (
      selectedRun.entryStress.cohorts.find((cohort) => cohort.startDate === selectedCohortStart) ??
      selectedRun.entryStress.worstByLoss
    );
  }, [selectedRun, selectedCohortStart]);

  async function loadHistories(signal?: AbortSignal) {
    setIsLoading(true);
    setError("");
    setStatus("Loading SPY, QQQ, TQQQ, BIL, SMH, and SOXL from inception");

    try {
      const results = await Promise.all(
        REQUIRED_SYMBOLS.map(async (symbol) => {
          const response = await fetch(`/api/history?symbol=${symbol}&range=max`, { signal });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? `Could not load ${symbol}`);
          }
          return [symbol, payload.bars as Bar[]] as const;
        }),
      );

      const nextHistories = Object.fromEntries(results) as CompleteHistoryMap;
      setHistories(nextHistories);
      const latest = results.map(([, bars]) => bars.at(-1)?.date ?? "").sort().at(-1);
      setStatus(`Live full-history backtests updated through ${latest ?? "latest close"}`);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Could not load market data");
      setStatus("Market data unavailable");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="product-hero">
        <div className="hero-copy">
          <span className="eyebrow">ABC Strategy Lab</span>
          <h1>Live inception backtests for the three candidate strategies.</h1>
          <p>
            The saved TQQQ Strategy 1 is now part of the live lab beside A/B/C. Each
            strategy has explicit allocation rules, exits, and bad-timing stress tests
            that show what happened to investors who started near historical peaks.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => loadHistories()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh live data"}
          </button>
          <span>{status}</span>
        </div>
      </section>

      <section className="control-strip" aria-label="Backtest assumptions">
        <label>
          <span>Initial capital</span>
          <input
            min={1000}
            step={1000}
            type="number"
            value={initialCash}
            onChange={(event) => setInitialCash(clampNumber(event.target.valueAsNumber, 1000, 100000000))}
          />
        </label>
        <label>
          <span>Cost per switch, bps</span>
          <input
            min={0}
            max={100}
            step={1}
            type="number"
            value={costBps}
            onChange={(event) => setCostBps(clampNumber(event.target.valueAsNumber, 0, 100))}
          />
        </label>
        <div>
          <span>Data window</span>
          <strong>Since ETF inception, daily adjusted OHLC</strong>
        </div>
        <div>
          <span>Updated through</span>
          <strong>{newestDate}</strong>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="snapshot-grid" aria-label="Strategy highlights">
        <MetricCard label="Best CAGR" value={bestCagr ? `${bestCagr.label}: ${formatPercent(bestCagr.stats.cagr)}` : "Loading"} tone="positive" />
        <MetricCard label="Smallest drawdown" value={bestDrawdown ? `${bestDrawdown.label}: ${formatPercent(bestDrawdown.stats.maxDrawdown)}` : "Loading"} tone="calm" />
        <MetricCard label="Strategies live" value={runs.length ? `${runs.length} of ${STRATEGY_ORDER.length}` : "Loading"} tone="neutral" />
        <MetricCard label="Current focus" value={selectedRun?.label ?? "Strategy 1"} tone="neutral" />
      </section>

      <section className="strategy-grid" aria-label="Strategy selector">
        {STRATEGY_ORDER.map((id) => {
          const run = runs.find((candidate) => candidate.id === id);
          const copy = STRATEGY_COPY[id];
          return (
            <button
              className={`strategy-card ${selectedId === id ? "selected" : ""}`}
              key={id}
              type="button"
              onClick={() => {
                setSelectedId(id);
                setSelectedCohortStart(null);
                setChartView("equity");
              }}
            >
              <span>{copy.label}</span>
              <strong>{copy.title}</strong>
              <p>{copy.subtitle}</p>
              <div className="mini-metrics">
                <span>
                  <b>{run ? formatPercent(run.stats.cagr) : "..."}</b>
                  <small>CAGR</small>
                </span>
                <span>
                  <b>{run ? formatPercent(run.stats.maxDrawdown) : "..."}</b>
                  <small>Max DD</small>
                </span>
                <span>
                  <b>{run ? formatPercent(run.stats.exposure) : "..."}</b>
                  <small>Exposure</small>
                </span>
                <span>
                  <b>{run?.entryStress.worstByLoss ? formatPercent(run.entryStress.worstByLoss.minLoss) : "..."}</b>
                  <small>Worst start</small>
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {selectedRun ? (
        <section className="workbench">
          <div className="workbench-head">
            <div>
              <span className="eyebrow">{selectedRun.label}</span>
              <h2>{selectedRun.title}</h2>
              <p>{selectedRun.plainEnglish}</p>
            </div>
            <div className="allocation-card">
              <span>Current allocation</span>
              <strong>{selectedRun.currentAllocation}</strong>
              <small>{selectedRun.latestReason}</small>
            </div>
          </div>

          <div className="metrics-row">
            <MetricCard label="CAGR" value={formatPercent(selectedRun.stats.cagr)} tone={selectedRun.stats.cagr > 0.3 ? "positive" : "neutral"} />
            <MetricCard label="Max drawdown" value={formatPercent(selectedRun.stats.maxDrawdown)} tone={selectedRun.stats.maxDrawdown > -0.4 ? "calm" : "warning"} />
            <MetricCard label="Sharpe" value={formatNumber(selectedRun.stats.sharpe, 2)} tone="neutral" />
            <MetricCard label="Final equity" value={formatCurrency(selectedRun.stats.finalEquity)} tone="neutral" />
            <MetricCard label="Exposure" value={formatPercent(selectedRun.stats.exposure)} tone="neutral" />
            <MetricCard label={selectedRun.id === "C" ? "Closed trades" : "Allocation switches"} value={String(selectedRun.stats.trades)} tone="neutral" />
            <MetricCard
              label="Worst entry loss"
              value={selectedRun.entryStress.worstByLoss ? formatPercent(selectedRun.entryStress.worstByLoss.minLoss) : "N/A"}
              tone={stressMetricTone(selectedRun.entryStress.worstByLoss?.minLoss ?? 0)}
            />
            <MetricCard
              label="Worst recovery"
              value={formatRecoveryDuration(selectedRun.entryStress.worstByLoss)}
              tone={selectedRun.entryStress.tone}
            />
          </div>

          <div className="chart-panel">
            <div className="chart-title">
              <div>
                <span>{chartTitle(chartView)}</span>
                <strong>
                  {chartSubtitle(selectedRun, chartView, chartRange, selectedCohort)}
                </strong>
              </div>
              <div>
                <span>{chartView === "cohort" ? "Selected start" : "Total return"}</span>
                <strong>{chartView === "cohort" ? selectedCohort?.startDate ?? "N/A" : formatPercent(selectedRun.stats.totalReturn)}</strong>
              </div>
            </div>
            <div className="chart-controls" aria-label="Interactive chart controls">
              <div className="segmented-control" role="group" aria-label="Chart view">
                {CHART_VIEW_OPTIONS.map((option) => (
                  <button
                    className={`control-chip ${chartView === option.value ? "active" : ""}`}
                    disabled={option.value === "cohort" && !selectedCohort}
                    key={option.value}
                    type="button"
                    onClick={() => setChartView(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="segmented-control" role="group" aria-label="Chart range">
                {CHART_RANGE_OPTIONS.map((option) => (
                  <button
                    className={`control-chip ${chartRange === option.value ? "active" : ""}`}
                    disabled={chartView === "cohort"}
                    key={option.value}
                    type="button"
                    onClick={() => setChartRange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <InteractiveBacktestChart
              cohort={selectedCohort}
              label={selectedRun.title}
              points={selectedRun.points}
              range={chartRange}
              view={chartView}
            />
          </div>

          <section className="stress-panel">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">Bad Timing Stress Test</span>
                <h2>What if a client started at the worst historical entry point?</h2>
              </div>
              <p>
                Every eligible trading-day start is normalized to 100. The table ranks the
                worst starts by loss from the entry date, then measures how long breakeven took.
              </p>
            </div>
            <div className="stress-summary">
              <MetricCard
                label="Worst observed start"
                value={selectedRun.entryStress.worstByLoss?.startDate ?? "N/A"}
                tone="neutral"
              />
              <MetricCard
                label="Deepest loss from entry"
                value={selectedRun.entryStress.worstByLoss ? formatPercent(selectedRun.entryStress.worstByLoss.minLoss) : "N/A"}
                tone={stressMetricTone(selectedRun.entryStress.worstByLoss?.minLoss ?? 0)}
              />
              <MetricCard
                label="Median recovery"
                value={formatDays(selectedRun.entryStress.medianRecoveryDays)}
                tone="calm"
              />
              <MetricCard
                label="90th percentile recovery"
                value={formatDays(selectedRun.entryStress.p90RecoveryDays)}
                tone={selectedRun.entryStress.p90RecoveryDays != null && selectedRun.entryStress.p90RecoveryDays <= 365 ? "calm" : "warning"}
              />
              <article className={`verdict-card ${selectedRun.entryStress.tone}`}>
                <span>Client-readiness verdict</span>
                <strong>{selectedRun.entryStress.verdict}</strong>
                <small>
                  Ranked starts require at least {selectedRun.entryStress.minFollowThroughDays} trading days of follow-through.
                  {selectedRun.entryStress.unrecoveredCount > 0 ? ` ${selectedRun.entryStress.unrecoveredCount} cohorts were still below breakeven at latest close.` : " All losing cohorts recovered by latest close."}
                </small>
              </article>
            </div>
            <div className="table-wrap stress-table">
              <table>
                <thead>
                  <tr>
                    <th>Entry date</th>
                    <th>Deepest loss</th>
                    <th>Trough date</th>
                    <th>Breakeven date</th>
                    <th>Recovery time</th>
                    <th>Final return</th>
                    <th>Start CAGR</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRun.entryStress.cohorts.slice(0, 6).map((cohort) => (
                    <tr className={selectedCohort?.startDate === cohort.startDate ? "selected-row" : ""} key={`${selectedRun.id}-${cohort.startDate}`}>
                      <td>
                        <button
                          className="table-button"
                          type="button"
                          onClick={() => {
                            setSelectedCohortStart(cohort.startDate);
                            setChartView("cohort");
                          }}
                        >
                          {cohort.startDate}
                        </button>
                      </td>
                      <td>{formatPercent(cohort.minLoss)}</td>
                      <td>{cohort.troughDate}</td>
                      <td>{cohort.recoveryDate ?? "Not recovered"}</td>
                      <td>{formatRecoveryDuration(cohort)}</td>
                      <td>{formatPercent(cohort.finalReturn)}</td>
                      <td>{formatPercent(cohort.cagr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="detail-grid">
            <section className="panel">
              <span className="section-kicker">Rules</span>
              <h3>What has to be true</h3>
              <ul className="rule-list">
                {selectedRun.rules.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </section>
            <section className="panel">
              <span className="section-kicker">Exits</span>
              <h3>How the strategy gets out</h3>
              <ul className="rule-list">
                {selectedRun.exits.map((exit) => <li key={exit}>{exit}</li>)}
              </ul>
            </section>
            <section className="panel">
              <span className="section-kicker">Read this first</span>
              <h3>Strategy synthesis</h3>
              <p className="plain-note">{selectedRun.riskProfile}</p>
              <p className="plain-note">{selectedRun.caveat}</p>
              {selectedRun.stats.winRate == null ? null : (
                <p className="plain-note">Win rate on closed trades: {formatPercent(selectedRun.stats.winRate)}</p>
              )}
            </section>
          </div>
        </section>
      ) : (
        <section className="loading-panel">Waiting for live market data...</section>
      )}

      <section className="comparison-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Glance table</span>
            <h2>Compare Strategy 1 and A/B/C on the same assumptions</h2>
          </div>
          <p>Higher CAGR is useful only beside drawdown, exposure, and trade count.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>CAGR</th>
                <th>Max DD</th>
                <th>Sharpe</th>
                <th>Exposure</th>
                <th>Trades</th>
                <th>Worst entry loss</th>
                <th>Worst recovery</th>
                <th>Current allocation</th>
                <th>Window</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>
                    <strong>{run.label}</strong>
                    <small>{run.title}</small>
                  </td>
                  <td>{formatPercent(run.stats.cagr)}</td>
                  <td>{formatPercent(run.stats.maxDrawdown)}</td>
                  <td>{formatNumber(run.stats.sharpe, 2)}</td>
                  <td>{formatPercent(run.stats.exposure)}</td>
                  <td>{run.stats.trades}</td>
                  <td>{run.entryStress.worstByLoss ? formatPercent(run.entryStress.worstByLoss.minLoss) : "N/A"}</td>
                  <td>{formatRecoveryDuration(run.entryStress.worstByLoss)}</td>
                  <td>{run.currentAllocation}</td>
                  <td>
                    {run.stats.startDate}
                    <small>to {run.stats.endDate}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Strategy2SweepSection />

      <section className="archive-section">
        <div>
          <span className="eyebrow">Archive</span>
          <h2>Previous strategies are retained as research, not the main product.</h2>
          <p>
            The old ETF-wide Bollinger/RSI entry screen is no longer ranked on the live
            dashboard because it treated entries as positions and did not define a careful
            trade exit. It stays here as a reference point while Strategy 1, A/B/C, and
            the Strategy 2 IRR sweep are reviewed separately.
          </p>
        </div>
        <div className="archive-grid">
          <article>
            <strong>Archived Strategy 2</strong>
            <span>ETF-wide Bollinger/RSI screen</span>
            <p>Useful for finding oversold or overbought moments, but incomplete as a standalone strategy without exits.</p>
          </article>
          <article>
            <strong>Archived baseline</strong>
            <span>Earlier TQQQ research variants</span>
            <p>Prior TQQQ regime experiments stay out of the main ranking unless their exact rule set is promoted into the live tool.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function buildStrategyRuns(histories: CompleteHistoryMap, initialCash: number, costBps: number) {
  return [
    runTqqqStrategy1(histories, initialCash, costBps),
    runCandidateA(histories, initialCash, costBps),
    runCandidateB(histories, initialCash, costBps),
    runCandidateC(histories, initialCash, costBps),
  ];
}

function runTqqqStrategy1(histories: CompleteHistoryMap, initialCash: number, costBps: number): StrategyRun {
  const aligned = alignHistories(histories, ["SPY", "TQQQ", "BIL"]);
  const spy = closes(aligned.barsBySymbol.SPY);
  const tqqq = closes(aligned.barsBySymbol.TQQQ);
  const bil = closes(aligned.barsBySymbol.BIL);
  const spySma10 = sma(spy, 10);
  const spySma20 = sma(spy, 20);
  const spySma200 = sma(spy, 200);
  const costRate = costBps / 10000;

  let equity = initialCash;
  let peak = initialCash;
  let position: Position = "BIL";
  let heldReason = "Indicator warmup";
  let switches = 0;
  let exposureDays = 0;
  const points: StrategyPoint[] = [{
    date: aligned.dates[0],
    equity,
    drawdown: 0,
    position,
    reason: heldReason,
    exposure: false,
  }];

  for (let index = 1; index < aligned.dates.length; index += 1) {
    const heldCloses = position === "TQQQ" ? tqqq : bil;
    equity *= heldCloses[index] / heldCloses[index - 1];
    if (position === "TQQQ") exposureDays += 1;
    peak = Math.max(peak, equity);
    points.push({
      date: aligned.dates[index],
      equity,
      drawdown: equity / peak - 1,
      position,
      reason: heldReason,
      exposure: position === "TQQQ",
    });

    const decision = decideTqqqStrategy1({
      index,
      spy,
      spySma10,
      spySma20,
      spySma200,
    });
    if (decision.position !== position) {
      if (index < aligned.dates.length - 1) {
        equity *= 1 - costRate;
        switches += 1;
        peak = Math.max(peak, equity);
        const currentPoint = points[points.length - 1];
        currentPoint.equity = equity;
        currentPoint.drawdown = equity / peak - 1;
      }
      position = decision.position;
    }
    heldReason = decision.reason;
  }

  return makeRun({
    copy: STRATEGY_COPY.S1,
    points,
    trades: [],
    tradeCount: switches,
    exposureDays,
    initialCash,
    currentAllocation: position === "TQQQ" ? "TQQQ" : "BIL",
    latestReason: heldReason,
  });
}

function decideTqqqStrategy1(input: {
  index: number;
  spy: number[];
  spySma10: Array<number | null>;
  spySma20: Array<number | null>;
  spySma200: Array<number | null>;
}) {
  const i = input.index;
  if (input.spySma10[i] == null || input.spySma20[i] == null || input.spySma200[i] == null) {
    return { position: "BIL" as Position, reason: "Indicator warmup" };
  }
  if (input.spy[i] < input.spySma200[i]!) {
    return { position: "BIL" as Position, reason: "SPY is below its 200-day trend gate" };
  }
  if (input.spySma10[i]! > input.spySma200[i]!) {
    return { position: "TQQQ" as Position, reason: "SPY long-term trend and 10-day confirmation are positive" };
  }
  if (input.spy[i] > input.spySma20[i]!) {
    return { position: "TQQQ" as Position, reason: "SPY remains above its 20-day weak-uptrend gate" };
  }
  return { position: "BIL" as Position, reason: "No TQQQ regime confirmation" };
}

function runCandidateA(histories: CompleteHistoryMap, initialCash: number, costBps: number): StrategyRun {
  const aligned = alignHistories(histories, ["SPY", "QQQ", "TQQQ", "BIL"]);
  const spy = closes(aligned.barsBySymbol.SPY);
  const qqq = closes(aligned.barsBySymbol.QQQ);
  const tqqq = closes(aligned.barsBySymbol.TQQQ);
  const bil = closes(aligned.barsBySymbol.BIL);
  const spySma10 = sma(spy, 10);
  const spySma20 = sma(spy, 20);
  const spySma200 = sma(spy, 200);
  const qqqSma50 = sma(qqq, 50);
  const qqqSma180 = sma(qqq, 180);
  const qqqRsi10 = rsi(qqq, 10);
  const tqqqRsi10 = rsi(tqqq, 10);
  const qqqVol20 = realizedVol(qqq, 20);
  const costRate = costBps / 10000;

  let equity = initialCash;
  let peak = initialCash;
  let position: Position = "BIL";
  let heldReason = "Indicator warmup";
  let cooldown = 0;
  let switches = 0;
  let exposureDays = 0;
  const points: StrategyPoint[] = [{
    date: aligned.dates[0],
    equity,
    drawdown: 0,
    position,
    reason: heldReason,
    exposure: false,
  }];

  for (let index = 1; index < aligned.dates.length; index += 1) {
    const heldCloses = position === "TQQQ" ? tqqq : bil;
    equity *= heldCloses[index] / heldCloses[index - 1];
    if (position === "TQQQ") exposureDays += 1;
    peak = Math.max(peak, equity);
    points.push({
      date: aligned.dates[index],
      equity,
      drawdown: equity / peak - 1,
      position,
      reason: heldReason,
      exposure: position === "TQQQ",
    });

    const decision = decideCandidateA({
      index,
      cooldown,
      spy,
      qqq,
      spySma10,
      spySma20,
      spySma200,
      qqqSma50,
      qqqSma180,
      qqqRsi10,
      tqqqRsi10,
      qqqVol20,
    });
    cooldown = decision.cooldown;
    if (decision.position !== position) {
      if (index < aligned.dates.length - 1) {
        equity *= 1 - costRate;
        switches += 1;
        peak = Math.max(peak, equity);
        const currentPoint = points[points.length - 1];
        currentPoint.equity = equity;
        currentPoint.drawdown = equity / peak - 1;
      }
      position = decision.position;
    }
    heldReason = decision.reason;
  }

  return makeRun({
    copy: STRATEGY_COPY.A,
    points,
    trades: [],
    tradeCount: switches,
    exposureDays,
    initialCash,
    currentAllocation: position === "TQQQ" ? "TQQQ" : "BIL",
    latestReason: heldReason,
  });
}

function decideCandidateA(input: {
  index: number;
  cooldown: number;
  spy: number[];
  qqq: number[];
  spySma10: Array<number | null>;
  spySma20: Array<number | null>;
  spySma200: Array<number | null>;
  qqqSma50: Array<number | null>;
  qqqSma180: Array<number | null>;
  qqqRsi10: Array<number | null>;
  tqqqRsi10: Array<number | null>;
  qqqVol20: Array<number | null>;
}) {
  const i = input.index;
  if (
    input.spySma10[i] == null ||
    input.spySma20[i] == null ||
    input.spySma200[i] == null ||
    input.qqqSma50[i] == null ||
    input.qqqSma180[i] == null ||
    input.qqqRsi10[i] == null ||
    input.tqqqRsi10[i] == null ||
    input.qqqVol20[i] == null
  ) {
    return { position: "BIL" as Position, reason: "Indicator warmup", cooldown: input.cooldown };
  }
  if (input.spy[i] < input.spySma200[i]!) {
    return { position: "BIL" as Position, reason: "SPY is below its 200-day trend gate", cooldown: input.cooldown };
  }
  if (input.qqq[i] < input.qqqSma180[i]!) {
    return { position: "BIL" as Position, reason: "QQQ is below its 180-day trend gate", cooldown: input.cooldown };
  }
  if (input.tqqqRsi10[i]! > 79) {
    return { position: "BIL" as Position, reason: "TQQQ is overbought, cooling down", cooldown: 3 };
  }
  if (input.cooldown > 0) {
    return { position: "BIL" as Position, reason: "Cooldown after overbought TQQQ signal", cooldown: input.cooldown - 1 };
  }
  if (input.qqqVol20[i]! > 0.35) {
    return { position: "BIL" as Position, reason: "QQQ realized volatility is above the risk brake", cooldown: input.cooldown };
  }
  if (input.spySma10[i]! > input.spySma200[i]! && input.qqqSma50[i]! > input.qqqSma180[i]!) {
    return { position: "TQQQ" as Position, reason: "SPY and QQQ trend confirmation are positive", cooldown: input.cooldown };
  }
  if (input.qqqRsi10[i]! < 30 && input.qqq[i] > input.qqqSma180[i]!) {
    return { position: "TQQQ" as Position, reason: "QQQ is oversold inside an intact uptrend", cooldown: input.cooldown };
  }
  if (input.spy[i] > input.spySma20[i]!) {
    return { position: "TQQQ" as Position, reason: "SPY remains above its short-term trend", cooldown: input.cooldown };
  }
  return { position: "BIL" as Position, reason: "No positive Nasdaq setup", cooldown: input.cooldown };
}

function runCandidateB(histories: CompleteHistoryMap, initialCash: number, costBps: number): StrategyRun {
  const aligned = alignHistories(histories, ["SPY", "SMH", "SOXL", "BIL"]);
  const spy = closes(aligned.barsBySymbol.SPY);
  const smh = closes(aligned.barsBySymbol.SMH);
  const soxl = closes(aligned.barsBySymbol.SOXL);
  const bil = closes(aligned.barsBySymbol.BIL);
  const spySma200 = sma(spy, 200);
  const smhSma20 = sma(smh, 20);
  const smhSma200 = sma(smh, 200);
  const smhRsi10 = rsi(smh, 10);
  const soxlRsi10 = rsi(soxl, 10);
  const smhVol20 = realizedVol(smh, 20);
  const costRate = costBps / 10000;

  let equity = initialCash;
  let peak = initialCash;
  let position: Position = "BIL";
  let heldReason = "Indicator warmup";
  let cooldown = 0;
  let switches = 0;
  let exposureDays = 0;
  const points: StrategyPoint[] = [{
    date: aligned.dates[0],
    equity,
    drawdown: 0,
    position,
    reason: heldReason,
    exposure: false,
  }];

  for (let index = 1; index < aligned.dates.length; index += 1) {
    const heldCloses = position === "SOXL" ? soxl : bil;
    equity *= heldCloses[index] / heldCloses[index - 1];
    if (position === "SOXL") exposureDays += 1;
    peak = Math.max(peak, equity);
    points.push({
      date: aligned.dates[index],
      equity,
      drawdown: equity / peak - 1,
      position,
      reason: heldReason,
      exposure: position === "SOXL",
    });

    const decision = decideCandidateB({
      index,
      cooldown,
      spy,
      smh,
      spySma200,
      smhSma20,
      smhSma200,
      smhRsi10,
      soxlRsi10,
      smhVol20,
    });
    cooldown = decision.cooldown;
    if (decision.position !== position) {
      if (index < aligned.dates.length - 1) {
        equity *= 1 - costRate;
        switches += 1;
        peak = Math.max(peak, equity);
        const currentPoint = points[points.length - 1];
        currentPoint.equity = equity;
        currentPoint.drawdown = equity / peak - 1;
      }
      position = decision.position;
    }
    heldReason = decision.reason;
  }

  return makeRun({
    copy: STRATEGY_COPY.B,
    points,
    trades: [],
    tradeCount: switches,
    exposureDays,
    initialCash,
    currentAllocation: position === "SOXL" ? "SOXL" : "BIL",
    latestReason: heldReason,
  });
}

function decideCandidateB(input: {
  index: number;
  cooldown: number;
  spy: number[];
  smh: number[];
  spySma200: Array<number | null>;
  smhSma20: Array<number | null>;
  smhSma200: Array<number | null>;
  smhRsi10: Array<number | null>;
  soxlRsi10: Array<number | null>;
  smhVol20: Array<number | null>;
}) {
  const i = input.index;
  if (
    input.spySma200[i] == null ||
    input.smhSma20[i] == null ||
    input.smhSma200[i] == null ||
    input.smhRsi10[i] == null ||
    input.soxlRsi10[i] == null ||
    input.smhVol20[i] == null
  ) {
    return { position: "BIL" as Position, reason: "Indicator warmup", cooldown: input.cooldown };
  }
  if (input.spy[i] < input.spySma200[i]!) {
    return { position: "BIL" as Position, reason: "SPY is below its 200-day trend gate", cooldown: input.cooldown };
  }
  if (input.smh[i] < input.smhSma200[i]!) {
    return { position: "BIL" as Position, reason: "SMH is below its 200-day trend gate", cooldown: input.cooldown };
  }
  if (input.soxlRsi10[i]! > 79) {
    return { position: "BIL" as Position, reason: "SOXL is overbought, cooling down", cooldown: 2 };
  }
  if (input.cooldown > 0) {
    return { position: "BIL" as Position, reason: "Cooldown after overbought SOXL signal", cooldown: input.cooldown - 1 };
  }
  if (input.smhVol20[i]! > 0.4) {
    return { position: "BIL" as Position, reason: "SMH volatility is above the risk brake", cooldown: input.cooldown };
  }
  if (input.smhSma20[i]! > input.smhSma200[i]!) {
    return { position: "SOXL" as Position, reason: "SMH short-term trend is above long-term trend", cooldown: input.cooldown };
  }
  if (input.smhRsi10[i]! < 30 && input.smh[i] > input.smhSma200[i]!) {
    return { position: "SOXL" as Position, reason: "SMH is oversold inside an intact uptrend", cooldown: input.cooldown };
  }
  if (input.smh[i] > input.smhSma20[i]!) {
    return { position: "SOXL" as Position, reason: "SMH remains above its 20-day average", cooldown: input.cooldown };
  }
  return { position: "BIL" as Position, reason: "No positive semiconductor setup", cooldown: input.cooldown };
}

function runCandidateC(histories: CompleteHistoryMap, initialCash: number, costBps: number): StrategyRun {
  const aligned = alignHistories(histories, ["SMH", "SOXL"]);
  const smhBars = aligned.barsBySymbol.SMH;
  const soxlBars = aligned.barsBySymbol.SOXL;
  const smhClose = closes(smhBars);
  const smhLow = smhBars.map((bar) => bar.low);
  const bands = bollinger(smhClose, 20, 2);
  const smhRsi14 = rsi(smhClose, 14);
  const smhSma200 = sma(smhClose, 200);
  const soxlAtr14 = atr(soxlBars, 14);
  const costRate = costBps / 10000;

  let cash = initialCash;
  let shares = 0;
  let equity = initialCash;
  let peak = initialCash;
  let inPosition = false;
  let pendingEntry = false;
  let entryDate = "";
  let entryPrice = 0;
  let entryCapital = 0;
  let stopPrice = 0;
  let targetPrice = 0;
  let holdDays = 0;
  let exposureDays = 0;
  let latestReason = "Waiting for a lower-band SMH washout";
  let currentAllocation = "Cash";
  const points: StrategyPoint[] = [];
  const trades: ClosedTrade[] = [];

  for (let index = 0; index < aligned.dates.length; index += 1) {
    const today = soxlBars[index];
    let hadExposureToday = inPosition;
    let enteredToday = false;

    if (pendingEntry && !inPosition) {
      const entryAtr = soxlAtr14[index - 1] ?? soxlAtr14[index] ?? 0;
      if (entryAtr > 0 && today.open > 0) {
        entryDate = aligned.dates[index];
        entryPrice = today.open;
        entryCapital = cash;
        stopPrice = Math.max(0.01, entryPrice - 1.5 * entryAtr);
        targetPrice = entryPrice + 2 * entryAtr;
        shares = (cash * (1 - costRate)) / entryPrice;
        cash = 0;
        holdDays = 0;
        inPosition = true;
        hadExposureToday = true;
        enteredToday = true;
        currentAllocation = "SOXL long";
        latestReason = "Entered SOXL after SMH lower-band washout";
      }
      pendingEntry = false;
    }

    if (inPosition) {
      const exitDecision = decideCandidateCExit({
        index,
        enteredToday,
        holdDays,
        smhClose,
        smhRsi14,
        middleBand: bands.middle,
        today,
        stopPrice,
        targetPrice,
      });

      if (exitDecision) {
        const proceeds = shares * exitDecision.price * (1 - costRate);
        const tradeReturn = entryCapital > 0 ? proceeds / entryCapital - 1 : 0;
        cash = proceeds;
        trades.push({
          entryDate,
          exitDate: aligned.dates[index],
          asset: "SOXL",
          entryPrice,
          exitPrice: exitDecision.price,
          returnPct: tradeReturn,
          days: Math.max(1, holdDays),
          reason: exitDecision.reason,
        });
        shares = 0;
        inPosition = false;
        currentAllocation = "Cash";
        latestReason = exitDecision.reason;
      } else {
        holdDays += 1;
      }
    }

    if (hadExposureToday) exposureDays += 1;
    equity = inPosition ? shares * today.close : cash;
    peak = Math.max(peak, equity);
    points.push({
      date: aligned.dates[index],
      equity,
      drawdown: equity / peak - 1,
      position: inPosition ? "SOXL" : "CASH",
      reason: latestReason,
      exposure: inPosition,
    });

    if (!inPosition && !pendingEntry && index < aligned.dates.length - 1) {
      if (shouldEnterCandidateC(index, smhClose, smhLow, bands.lower, smhRsi14, smhSma200)) {
        pendingEntry = true;
        currentAllocation = "SOXL next open";
        latestReason = "SMH touched lower band with RSI confirmation";
      } else {
        currentAllocation = "Cash";
        latestReason = waitingReasonCandidateC(index, smhClose, bands.lower, smhRsi14, smhSma200);
      }
    }
  }

  return makeRun({
    copy: STRATEGY_COPY.C,
    points,
    trades,
    tradeCount: trades.length,
    exposureDays,
    initialCash,
    currentAllocation,
    latestReason,
  });
}

function decideCandidateCExit(input: {
  index: number;
  enteredToday: boolean;
  holdDays: number;
  smhClose: number[];
  smhRsi14: Array<number | null>;
  middleBand: Array<number | null>;
  today: Bar;
  stopPrice: number;
  targetPrice: number;
}) {
  const prior = input.index - 1;
  if (!input.enteredToday && prior >= 0) {
    const revertedToMiddle = input.middleBand[prior] != null && input.smhClose[prior] >= input.middleBand[prior]!;
    const normalizedRsi = input.smhRsi14[prior] != null && input.smhRsi14[prior]! >= 50;
    if (revertedToMiddle || normalizedRsi) {
      return { price: input.today.open, reason: "Mean reversion exit at next open" };
    }
    if (input.holdDays >= 20) {
      return { price: input.today.open, reason: "Time stop after 20 sessions" };
    }
  }

  if (input.today.open <= input.stopPrice) {
    return { price: input.today.open, reason: "Gap stop at open" };
  }
  if (input.today.open >= input.targetPrice) {
    return { price: input.today.open, reason: "Gap target at open" };
  }
  const touchedStop = input.today.low <= input.stopPrice;
  const touchedTarget = input.today.high >= input.targetPrice;
  if (touchedStop) {
    return { price: input.stopPrice, reason: touchedTarget ? "Stop-first same-day barrier" : "ATR stop" };
  }
  if (touchedTarget) {
    return { price: input.targetPrice, reason: "ATR profit target" };
  }
  return null;
}

function shouldEnterCandidateC(
  index: number,
  smhClose: number[],
  smhLow: number[],
  lowerBand: Array<number | null>,
  smhRsi14: Array<number | null>,
  smhSma200: Array<number | null>,
) {
  if (lowerBand[index] == null || smhRsi14[index] == null || smhSma200[index] == null) return false;
  return smhLow[index] <= lowerBand[index]! && smhRsi14[index]! <= 40 && smhClose[index] > smhSma200[index]!;
}

function waitingReasonCandidateC(
  index: number,
  smhClose: number[],
  lowerBand: Array<number | null>,
  smhRsi14: Array<number | null>,
  smhSma200: Array<number | null>,
) {
  if (lowerBand[index] == null || smhRsi14[index] == null || smhSma200[index] == null) {
    return "Indicator warmup";
  }
  if (smhClose[index] <= smhSma200[index]!) {
    return "SMH is below the 200-day trend gate";
  }
  if (smhRsi14[index]! > 40) {
    return "Waiting for RSI to confirm a washout";
  }
  return "Waiting for SMH to touch the lower Bollinger Band";
}

function makeRun(input: {
  copy: Omit<StrategyRun, "points" | "stats" | "currentAllocation" | "latestReason" | "trades" | "entryStress">;
  points: StrategyPoint[];
  trades: ClosedTrade[];
  tradeCount: number;
  exposureDays: number;
  initialCash: number;
  currentAllocation: string;
  latestReason: string;
}): StrategyRun {
  const stats = summarizeStats(
    input.points,
    input.initialCash,
    input.tradeCount,
    input.exposureDays,
    input.trades,
  );
  return {
    ...input.copy,
    points: input.points,
    stats,
    trades: input.trades,
    currentAllocation: input.currentAllocation,
    latestReason: input.latestReason,
    entryStress: analyzeEntryTiming(input.points),
  };
}

function summarizeStats(
  points: StrategyPoint[],
  initialCash: number,
  trades: number,
  exposureDays: number,
  closedTrades: ClosedTrade[],
): StrategyStats {
  const first = points[0];
  const last = points.at(-1) ?? first;
  const returns = points.slice(1).map((point, index) => point.equity / points[index].equity - 1).filter(Number.isFinite);
  const years = Math.max(1 / 252, calendarYears(first.date, last.date));
  const finalEquity = last.equity;
  const averageReturn = mean(returns);
  const volatility = standardDeviation(returns);
  const winningTrades = closedTrades.filter((trade) => trade.returnPct > 0).length;

  return {
    cagr: Math.pow(finalEquity / initialCash, 1 / years) - 1,
    totalReturn: finalEquity / initialCash - 1,
    maxDrawdown: Math.min(...points.map((point) => point.drawdown)),
    sharpe: volatility === 0 ? 0 : (averageReturn / volatility) * Math.sqrt(252),
    trades,
    exposure: points.length === 0 ? 0 : exposureDays / points.length,
    finalEquity,
    testedYears: years,
    startDate: first.date,
    endDate: last.date,
    winRate: closedTrades.length === 0 ? null : winningTrades / closedTrades.length,
  };
}

function analyzeEntryTiming(points: StrategyPoint[]): EntryStressTest {
  const cohorts: EntryCohort[] = [];
  const last = points.at(-1);
  if (!last || points.length <= MIN_ENTRY_FOLLOW_THROUGH_DAYS + 1) {
    return {
      cohorts,
      worstByLoss: null,
      slowestRecovery: null,
      medianRecoveryDays: null,
      p90RecoveryDays: null,
      unrecoveredCount: 0,
      observedStartCount: 0,
      minFollowThroughDays: MIN_ENTRY_FOLLOW_THROUGH_DAYS,
      verdict: "Not enough history to score entry timing.",
      tone: "neutral",
    };
  }

  const lastEligibleStart = points.length - MIN_ENTRY_FOLLOW_THROUGH_DAYS - 1;
  for (let startIndex = 0; startIndex <= lastEligibleStart; startIndex += 1) {
    const startPoint = points[startIndex];
    if (startPoint.equity <= 0) continue;

    let troughIndex = startIndex;
    let minRatio = 1;
    for (let index = startIndex; index < points.length; index += 1) {
      const ratio = points[index].equity / startPoint.equity;
      if (ratio < minRatio) {
        minRatio = ratio;
        troughIndex = index;
      }
    }

    let recoveryIndex: number | null = startIndex;
    if (minRatio < 1) {
      recoveryIndex = null;
      for (let index = troughIndex; index < points.length; index += 1) {
        if (points[index].equity >= startPoint.equity) {
          recoveryIndex = index;
          break;
        }
      }
    }

    const years = Math.max(1 / 252, calendarYears(startPoint.date, last.date));
    const finalReturn = last.equity / startPoint.equity - 1;
    cohorts.push({
      startDate: startPoint.date,
      troughDate: points[troughIndex].date,
      recoveryDate: recoveryIndex == null ? null : points[recoveryIndex].date,
      minLoss: minRatio - 1,
      finalReturn,
      cagr: Math.pow(1 + finalReturn, 1 / years) - 1,
      tradingDaysToTrough: troughIndex - startIndex,
      tradingDaysToRecovery: recoveryIndex == null ? null : recoveryIndex - startIndex,
      calendarDaysToRecovery: recoveryIndex == null ? null : calendarDays(startPoint.date, points[recoveryIndex].date),
      startIndex,
    });
  }

  const ranked = [...cohorts].sort((left, right) => {
    if (left.minLoss !== right.minLoss) return left.minLoss - right.minLoss;
    return (right.calendarDaysToRecovery ?? Number.POSITIVE_INFINITY) - (left.calendarDaysToRecovery ?? Number.POSITIVE_INFINITY);
  });
  const recoveredLosingCohorts = cohorts
    .filter((cohort) => cohort.minLoss < 0 && cohort.calendarDaysToRecovery != null)
    .map((cohort) => cohort.calendarDaysToRecovery!)
    .sort((left, right) => left - right);
  const unrecoveredCount = cohorts.filter((cohort) => cohort.minLoss < 0 && cohort.recoveryDate == null).length;
  const slowestRecovery = maxBy(
    cohorts.filter((cohort) => cohort.calendarDaysToRecovery != null),
    (cohort) => cohort.calendarDaysToRecovery ?? 0,
  );
  const worstByLoss = ranked[0] ?? null;
  const medianRecoveryDays = percentile(recoveredLosingCohorts, 0.5);
  const p90RecoveryDays = percentile(recoveredLosingCohorts, 0.9);
  const verdict = entryStressVerdict(worstByLoss, p90RecoveryDays, unrecoveredCount);

  return {
    cohorts: ranked,
    worstByLoss,
    slowestRecovery,
    medianRecoveryDays,
    p90RecoveryDays,
    unrecoveredCount,
    observedStartCount: cohorts.length,
    minFollowThroughDays: MIN_ENTRY_FOLLOW_THROUGH_DAYS,
    verdict: verdict.text,
    tone: verdict.tone,
  };
}

function entryStressVerdict(
  worstByLoss: EntryCohort | null,
  p90RecoveryDays: number | null,
  unrecoveredCount: number,
) {
  if (!worstByLoss) {
    return { text: "Not enough entry cohorts to score.", tone: "neutral" as const };
  }
  if (unrecoveredCount > 0) {
    return { text: "Not bulletproof yet: some historical starts are still below breakeven.", tone: "danger" as const };
  }
  const worstRecovery = worstByLoss.calendarDaysToRecovery;
  if (worstRecovery != null && worstRecovery <= 365 && (p90RecoveryDays ?? 0) <= 180) {
    return { text: "Strong: worst start recovered within a year and most recoveries were faster.", tone: "positive" as const };
  }
  if (worstRecovery != null && worstRecovery <= 730) {
    return { text: "Credible but not bulletproof: worst start recovered within two years.", tone: "warning" as const };
  }
  return { text: "Needs more risk work: worst start recovery was too slow for a client promise.", tone: "danger" as const };
}

function alignHistories(histories: CompleteHistoryMap, symbols: SymbolKey[]) {
  const maps = Object.fromEntries(
    symbols.map((symbol) => [symbol, new Map(histories[symbol].map((bar) => [bar.date, bar]))]),
  ) as Record<SymbolKey, Map<string, Bar>>;
  const dates = [...maps[symbols[0]].keys()]
    .filter((date) => symbols.every((symbol) => maps[symbol].has(date)))
    .sort();
  const barsBySymbol = Object.fromEntries(
    symbols.map((symbol) => [symbol, dates.map((date) => maps[symbol].get(date)!).filter(Boolean)]),
  ) as Record<SymbolKey, Bar[]>;
  return { dates, barsBySymbol };
}

function closes(bars: Bar[]) {
  return bars.map((bar) => bar.close);
}

function sma(values: number[], period: number) {
  const output = Array<number | null>(values.length).fill(null);
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) {
    sum += values[index];
    if (index >= period) sum -= values[index - period];
    if (index >= period - 1) output[index] = sum / period;
  }
  return output;
}

function rsi(values: number[], period: number) {
  const output = Array<number | null>(values.length).fill(null);
  if (values.length <= period) return output;
  let gain = 0;
  let loss = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    if (change >= 0) gain += change;
    else loss -= change;
  }
  let averageGain = gain / period;
  let averageLoss = loss / period;
  output[period] = rsiFromAverages(averageGain, averageLoss);

  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    output[index] = rsiFromAverages(averageGain, averageLoss);
  }
  return output;
}

function rsiFromAverages(averageGain: number, averageLoss: number) {
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

function realizedVol(values: number[], period: number) {
  const output = Array<number | null>(values.length).fill(null);
  for (let index = period; index < values.length; index += 1) {
    const returns: number[] = [];
    for (let lookback = index - period + 1; lookback <= index; lookback += 1) {
      returns.push(Math.log(values[lookback] / values[lookback - 1]));
    }
    output[index] = standardDeviation(returns) * Math.sqrt(252);
  }
  return output;
}

function bollinger(values: number[], period: number, deviations: number) {
  const middle = Array<number | null>(values.length).fill(null);
  const upper = Array<number | null>(values.length).fill(null);
  const lower = Array<number | null>(values.length).fill(null);
  let sum = 0;
  let sumSquares = 0;

  for (let index = 0; index < values.length; index += 1) {
    sum += values[index];
    sumSquares += values[index] * values[index];
    if (index >= period) {
      sum -= values[index - period];
      sumSquares -= values[index - period] * values[index - period];
    }
    if (index >= period - 1) {
      const average = sum / period;
      const variance = Math.max(0, sumSquares / period - average * average);
      const bandWidth = Math.sqrt(variance) * deviations;
      middle[index] = average;
      upper[index] = average + bandWidth;
      lower[index] = average - bandWidth;
    }
  }
  return { middle, upper, lower };
}

function atr(bars: Bar[], period: number) {
  const trueRanges = bars.map((bar, index) => {
    if (index === 0) return bar.high - bar.low;
    const previousClose = bars[index - 1].close;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - previousClose),
      Math.abs(bar.low - previousClose),
    );
  });
  return sma(trueRanges, period);
}

function InteractiveBacktestChart({
  points,
  label,
  view,
  range,
  cohort,
}: {
  points: StrategyPoint[];
  label: string;
  view: ChartView;
  range: ChartRange;
  cohort: EntryCohort | null;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const visiblePoints = chartPoints(points, view, range, cohort);
  if (visiblePoints.length < 2) {
    return <div className="empty-chart">Chart loads after live data arrives.</div>;
  }

  const values = visiblePoints.map((point) => point.value);
  const min = chartMin(values, view);
  const max = chartMax(values, view);
  const valueRange = Math.max(0.0001, max - min);
  const width = 900;
  const height = 280;

  const path = visiblePoints.map((point, index) => {
    const x = (index / (visiblePoints.length - 1)) * width;
    const y = height - ((point.value - min) / valueRange) * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const baselineValue = view === "cohort" ? 100 : view === "drawdown" ? 0 : null;
  const baselineY = baselineValue == null ? null : height - ((baselineValue - min) / valueRange) * height;
  const hoverPoint = hoverIndex == null ? null : visiblePoints[hoverIndex] ?? null;
  const hoverX = hoverIndex == null ? 0 : (hoverIndex / (visiblePoints.length - 1)) * width;
  const hoverY = hoverPoint == null ? 0 : height - ((hoverPoint.value - min) / valueRange) * height;

  function updateHover(clientX: number, currentTarget: SVGSVGElement) {
    const rect = currentTarget.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setHoverIndex(Math.round(ratio * (visiblePoints.length - 1)));
  }

  return (
    <div className="interactive-chart-shell">
      <svg
        className={`equity-chart ${view}`}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerMove={(event) => updateHover(event.clientX, event.currentTarget)}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        aria-label={`${label} ${chartTitle(view)}`}
      >
        <line x1="0" x2={width} y1={height - 1} y2={height - 1} />
        <line x1="0" x2={width} y1="1" y2="1" />
        {baselineY == null ? null : <line className="baseline" x1="0" x2={width} y1={baselineY} y2={baselineY} />}
        <path d={path} />
        {hoverPoint == null ? null : (
          <g>
            <line className="hover-line" x1={hoverX} x2={hoverX} y1="0" y2={height} />
            <circle className="hover-dot" cx={hoverX} cy={hoverY} r="5" />
          </g>
        )}
      </svg>
      {hoverPoint == null ? null : (
        <div
          className="chart-tooltip"
          style={{
            left: `${(hoverX / width) * 100}%`,
            top: `${(hoverY / height) * 100}%`,
          }}
        >
          <span>{hoverPoint.date}</span>
          <strong>{formatChartValue(hoverPoint.value, view)}</strong>
          <small>{hoverPoint.position} - {hoverPoint.reason}</small>
        </div>
      )}
    </div>
  );
}

function Strategy2SweepSection() {
  const allRows = [...STRATEGY_2_SWEEP.champions, ...STRATEGY_2_SWEEP.baselines];
  return (
    <section className="sweep-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Strategy 2 IRR Sweep</span>
          <h2>Monthly-contribution variants from the CAGR improvement report</h2>
        </div>
        <p>
          Generated {STRATEGY_2_SWEEP.generatedAt.slice(0, 10)} across {STRATEGY_2_SWEEP.months} monthly executions.
          Period: {STRATEGY_2_SWEEP.period}. These use annualized IRR, so they should not be directly ranked against
          the live lump-sum CAGR cards above.
        </p>
      </div>

      <div className="sweep-note">
        <strong>{STRATEGY_2_SWEEP.metricNote}</strong>
        <span>
          The report says the cleanest path to higher IRR is more persistent TQQQ exposure, but drawdown rises quickly.
          These variants are research until costs, taxes, and walk-forward splits are added.
        </span>
      </div>

      <div className="sweep-grid" aria-label="Strategy 2 champion variants">
        {STRATEGY_2_SWEEP.champions.map((row) => (
          <article className="sweep-card" key={`${row.bucket}-${row.name}`}>
            <span>{row.bucket}</span>
            <strong>{row.name}</strong>
            <p>{row.description}</p>
            <div className="sweep-metrics">
              <b>{formatPercent(row.annualizedIrr)}<small>IRR</small></b>
              <b>{formatPercent(row.maxDrawdown)}<small>Max DD</small></b>
              <b>{formatMultiple(row.moneyMultiple)}<small>Multiple</small></b>
              <b>{formatPercent(row.endingTqqqWeight)}<small>Ending TQQQ</small></b>
            </div>
          </article>
        ))}
      </div>

      <div className="table-wrap sweep-table">
        <table>
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Name</th>
              <th>IRR</th>
              <th>Max DD</th>
              <th>Final equity</th>
              <th>Multiple</th>
              <th>Contributions</th>
              <th>Ending TQQQ</th>
              <th>Action mix</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => (
              <tr key={`${row.bucket}-${row.name}`}>
                <td>{row.bucket}</td>
                <td>
                  <strong>{row.name}</strong>
                  <small>{row.description}</small>
                </td>
                <td>{formatPercent(row.annualizedIrr)}</td>
                <td>{formatPercent(row.maxDrawdown)}</td>
                <td>{formatCurrency(row.finalEquity)}</td>
                <td>{formatMultiple(row.moneyMultiple)}</td>
                <td>{formatCurrency(row.totalContributions)}</td>
                <td>{formatPercent(row.endingTqqqWeight)}</td>
                <td>{row.actionCounts.length ? row.actionCounts.map(([label, count]) => `${label}: ${count}`).join(", ") : "Baseline"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sweep-rules">
        {STRATEGY_2_SWEEP.champions.map((row) => (
          <section className="panel" key={`rules-${row.bucket}-${row.name}`}>
            <span className="section-kicker">{row.bucket}</span>
            <h3>{row.name}</h3>
            <ul className="rule-list">
              {row.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "positive" | "warning" | "danger" | "calm" | "neutral" }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function chartPoints(points: StrategyPoint[], view: ChartView, range: ChartRange, cohort: EntryCohort | null): ChartPoint[] {
  if (view === "cohort" && cohort) {
    const start = points[cohort.startIndex];
    if (!start || start.equity <= 0) return [];
    return points.slice(cohort.startIndex).map((point) => ({
      ...point,
      value: (point.equity / start.equity) * 100,
    }));
  }

  const ranged = range === "all" ? points : points.slice(Math.max(0, points.length - RANGE_TO_TRADING_DAYS[range]));
  return ranged.map((point) => ({
    ...point,
    value: view === "drawdown" ? point.drawdown : point.equity,
  }));
}

function chartMin(values: number[], view: ChartView) {
  const min = Math.min(...values);
  if (view === "drawdown") return Math.min(min, -0.01);
  if (view === "cohort") return Math.min(min, 100) * 0.98;
  return min * 0.96;
}

function chartMax(values: number[], view: ChartView) {
  const max = Math.max(...values);
  if (view === "drawdown") return 0;
  if (view === "cohort") return Math.max(max, 100) * 1.02;
  return max * 1.02;
}

function chartTitle(view: ChartView) {
  if (view === "drawdown") return "Drawdown chart";
  if (view === "cohort") return "Worst-start recovery path";
  return "Equity curve";
}

function chartSubtitle(run: StrategyRun, view: ChartView, range: ChartRange, cohort: EntryCohort | null) {
  if (view === "cohort" && cohort) {
    return `${cohort.startDate} to ${run.stats.endDate}, normalized to 100`;
  }
  if (view === "cohort") return "Select a stress-test row to inspect a start path";
  return `${rangeLabel(range)} - ${run.stats.startDate} to ${run.stats.endDate}`;
}

function rangeLabel(range: ChartRange) {
  return CHART_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? "All";
}

function formatChartValue(value: number, view: ChartView) {
  if (view === "drawdown") return formatPercent(value);
  if (view === "cohort") return value.toFixed(1);
  return formatCurrency(value);
}

function hasCompleteHistories(histories: HistoryMap): histories is CompleteHistoryMap {
  return REQUIRED_SYMBOLS.every((symbol) => Array.isArray(histories[symbol]) && histories[symbol]!.length > 250);
}

function maxBy<T>(items: T[], scorer: (item: T) => number) {
  return items.reduce<T | null>((best, item) => {
    if (!best) return item;
    return scorer(item) > scorer(best) ? item : best;
  }, null);
}

function percentile(values: number[], percentileRank: number) {
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];
  const index = Math.min(values.length - 1, Math.max(0, Math.ceil(percentileRank * values.length) - 1));
  return values[index];
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calendarYears(start: string, end: string) {
  return (Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) / (365.25 * 24 * 60 * 60 * 1000);
}

function calendarDays(start: string, end: string) {
  return Math.max(0, Math.round((Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) / (24 * 60 * 60 * 1000)));
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, decimals: number) {
  return value.toFixed(decimals);
}

function formatMultiple(value: number) {
  return `${value.toFixed(2)}x`;
}

function stressMetricTone(loss: number): "positive" | "warning" | "danger" | "calm" | "neutral" {
  if (loss >= -0.1) return "positive";
  if (loss >= -0.25) return "calm";
  if (loss >= -0.4) return "warning";
  return "danger";
}

function formatDays(days: number | null) {
  if (days == null) return "N/A";
  if (days === 0) return "0 days";
  if (days < 31) return `${days} days`;
  const months = days / 30.4375;
  if (months < 24) return `${months.toFixed(1)} mo`;
  return `${(days / 365.25).toFixed(1)} yrs`;
}

function formatRecoveryDuration(cohort: EntryCohort | null | undefined) {
  if (!cohort) return "N/A";
  if (cohort.minLoss >= 0) return "No loss";
  if (cohort.calendarDaysToRecovery == null) return "Not recovered";
  return formatDays(cohort.calendarDaysToRecovery);
}
