"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ETF_UNIVERSE, type EtfProfile } from "./data/etfs";

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

type Signal = "bullish" | "bearish" | "neutral" | "warmup";

type BacktestPoint = {
  date: string;
  close: number;
  equity: number;
  position: number;
  signal: Signal;
  rsi: number | null;
  upper: number | null;
  lower: number | null;
  reason: string;
};

type BacktestResult = {
  points: BacktestPoint[];
  startDate: string | null;
  endDate: string | null;
  tradingDays: number;
  testedYears: number;
  finalEquity: number;
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  totalReturn: number;
  buyHoldReturn: number;
  buyHoldCagr: number;
  buyHoldMaxDrawdown: number;
  alphaVsBuyHold: number;
  trades: number;
  exposure: number;
  latestSignal: BacktestPoint | null;
  signalCount: number;
};

type StrategySynthesis = {
  score: number;
  grade: string;
  tone: "strong" | "good" | "mixed" | "weak" | "empty";
  verdict: string;
  edge: string;
  risk: string;
  activity: string;
  driver: string;
};

type CachedRun = {
  status: "idle" | "loading" | "ready" | "error";
  range?: string;
  bars?: Bar[];
  result?: BacktestResult;
  synthesis?: StrategySynthesis;
  error?: string;
  updatedThrough?: string;
};

type MetricTone = Signal | StrategySynthesis["tone"];

const PERIOD_OPTIONS = [
  { label: "Since inception", value: "max" },
  { label: "1Y", value: "1y" },
  { label: "3Y", value: "3y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
];

const DEFAULT_SETTINGS = {
  bbPeriod: 20,
  bbDeviations: 2,
  rsiPeriod: 14,
  overbought: 70,
  oversold: 30,
  initialCash: 100000,
  mode: "long-cash",
};

export default function Home() {
  const [universe, setUniverse] = useState<EtfProfile[]>(ETF_UNIVERSE);
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(ETF_UNIVERSE[0].symbol);
  const [period, setPeriod] = useState("max");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [bars, setBars] = useState<Bar[]>([]);
  const [status, setStatus] = useState("Ready");
  const [batchStatus, setBatchStatus] = useState("No inception batch run yet");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonRuns, setComparisonRuns] = useState<Record<string, CachedRun>>({});
  const [isAnalyzingUniverse, setIsAnalyzingUniverse] = useState(false);
  const [comparisonLimit, setComparisonLimit] = useState(72);

  const eligibleUniverse = useMemo(
    () => universe.filter((etf) => etf.stockCount > 10),
    [universe],
  );

  const selectedEtf = useMemo(
    () => eligibleUniverse.find((etf) => etf.symbol === selectedSymbol) ?? eligibleUniverse[0],
    [eligibleUniverse, selectedSymbol],
  );

  const filteredUniverse = useMemo(() => {
    const normalized = query.trim().toUpperCase();
    if (!normalized) return eligibleUniverse;
    return eligibleUniverse.filter((etf) =>
      `${etf.symbol} ${etf.name} ${etf.segment}`.toUpperCase().includes(normalized),
    );
  }, [eligibleUniverse, query]);

  const result = useMemo(
    () => runBacktest(bars, settings),
    [bars, settings],
  );
  const selectedSynthesis = useMemo(
    () => synthesizeStrategy(result),
    [result],
  );
  const selectedRunLabel = useMemo(
    () => runWindowLabel(result),
    [result],
  );
  const rankedUniverse = useMemo(() => {
    return [...filteredUniverse].sort((left, right) => {
      const leftRun = comparisonRuns[left.symbol];
      const rightRun = comparisonRuns[right.symbol];
      const leftScore = leftRun?.range === period ? leftRun.synthesis?.score ?? -1 : -1;
      const rightScore = rightRun?.range === period ? rightRun.synthesis?.score ?? -1 : -1;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.symbol.localeCompare(right.symbol);
    });
  }, [comparisonRuns, filteredUniverse, period]);
  const analyzedCount = useMemo(
    () => filteredUniverse.filter((etf) => comparisonRuns[etf.symbol]?.status === "ready" && comparisonRuns[etf.symbol]?.range === period).length,
    [comparisonRuns, filteredUniverse, period],
  );

  useEffect(() => {
    if (!selectedEtf) return;
    const cached = comparisonRuns[selectedEtf.symbol];
    if (cached?.bars?.length && cached.range === period) {
      setBars(cached.bars);
      setStatus(`${selectedEtf.symbol} loaded from cache ${rangeCopy(period)} through ${cached.updatedThrough ?? "latest close"}`);
      return;
    }
    const controller = new AbortController();
    fetchHistory(selectedEtf.symbol, period, controller.signal);
    return () => controller.abort();
  }, [selectedEtf, period]);

  useEffect(() => {
    setComparisonRuns((current) =>
      Object.fromEntries(
        Object.entries(current).map(([symbol, run]) => {
          if (!run.bars?.length) return [symbol, run];
          const runResult = runBacktest(run.bars, settings);
          return [
            symbol,
            {
              ...run,
              result: runResult,
              synthesis: synthesizeStrategy(runResult),
            },
          ];
        }),
      ),
    );
  }, [settings]);

  function updateSetting(key: keyof typeof settings, value: number | string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function fetchHistory(symbol: string, range: string, signal?: AbortSignal) {
    setIsLoading(true);
    setError("");
    setStatus(`Loading ${symbol}`);
    try {
      const response = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`, { signal });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Price request failed");
      }
      setBars(payload.bars);
      cacheRun(symbol, payload.bars, range);
      const firstDate = payload.bars.at(0)?.date ?? "first available close";
      const lastDate = payload.bars.at(-1)?.date ?? "latest close";
      setStatus(`${symbol} tested ${rangeCopy(range)} from ${firstDate} through ${lastDate}`);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setBars([]);
      setError(caught instanceof Error ? caught.message : "Price request failed");
      setStatus("Data unavailable");
    } finally {
      setIsLoading(false);
    }
  }

  async function analyzeOneEtf(symbol: string) {
    setComparisonRuns((current) => ({
      ...current,
      [symbol]: { status: "loading", range: period },
    }));
    try {
      const response = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${period}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Price request failed");
      }
      cacheRun(symbol, payload.bars, period);
    } catch (caught) {
      setComparisonRuns((current) => ({
        ...current,
        [symbol]: {
          status: "error",
          error: caught instanceof Error ? caught.message : "Price request failed",
        },
      }));
    }
  }

  async function analyzeVisibleUniverse() {
    setIsAnalyzingUniverse(true);
    setBatchStatus(`Backtesting ${Math.min(comparisonLimit, filteredUniverse.length)} ETF strategies ${rangeCopy(period)}`);
    const symbols = filteredUniverse.slice(0, comparisonLimit).map((etf) => etf.symbol);
    for (const symbol of symbols) {
      const existing = comparisonRuns[symbol];
      if (existing?.status === "ready" && existing.result && existing.range === period) continue;
      await analyzeOneEtf(symbol);
    }
    setIsAnalyzingUniverse(false);
    setBatchStatus(`Backtested ${symbols.length} ETF strategies ${rangeCopy(period)}`);
  }

  function selectAnalyzedEtf(symbol: string) {
    setSelectedSymbol(symbol);
    const cached = comparisonRuns[symbol];
    if (cached?.bars?.length && cached.range === period) {
      setBars(cached.bars);
      setStatus(`${symbol} loaded from analyzed comparison ${rangeCopy(period)} ${cached.updatedThrough ? `through ${cached.updatedThrough}` : ""}`.trim());
    }
  }

  function cacheRun(symbol: string, loadedBars: Bar[], range: string) {
    const runResult = runBacktest(loadedBars, settings);
    setComparisonRuns((current) => ({
      ...current,
      [symbol]: {
        status: "ready",
        range,
        bars: loadedBars,
        result: runResult,
        synthesis: synthesizeStrategy(runResult),
        updatedThrough: loadedBars.at(-1)?.date,
      },
    }));
  }

  function addCustomEtf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const symbol = String(form.get("symbol") ?? "").trim().toUpperCase();
    const name = String(form.get("name") ?? "").trim() || `${symbol} ETF`;
    const stockCount = Number(form.get("stockCount") ?? 11);
    if (!symbol || stockCount <= 10) return;
    const profile: EtfProfile = {
      symbol,
      name,
      segment: "Imported",
      stockCount,
    };
    setUniverse((current) => [profile, ...current.filter((etf) => etf.symbol !== symbol)]);
    setSelectedSymbol(symbol);
    event.currentTarget.reset();
  }

  function importUniverse(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result ?? "").split(/\r?\n/).filter(Boolean);
      const [header, ...body] = rows;
      const headers = header.split(",").map((item) => item.trim().toLowerCase());
      const symbolIndex = headers.indexOf("symbol");
      const nameIndex = headers.indexOf("name");
      const stockCountIndex = headers.indexOf("stockcount");
      const segmentIndex = headers.indexOf("segment");
      if (symbolIndex < 0 || stockCountIndex < 0) {
        setError("CSV needs symbol and stockCount columns");
        return;
      }
      const imported = body
        .map((row) => row.split(","))
        .map((columns) => ({
          symbol: columns[symbolIndex]?.trim().toUpperCase(),
          name: columns[nameIndex]?.trim() || columns[symbolIndex]?.trim().toUpperCase(),
          stockCount: Number(columns[stockCountIndex]),
          segment: columns[segmentIndex]?.trim() || "Imported",
        }))
        .filter((etf): etf is EtfProfile => Boolean(etf.symbol) && etf.stockCount > 10);
      if (imported.length) {
        setUniverse((current) => [...imported, ...current]);
        setSelectedSymbol(imported[0].symbol);
        setStatus(`Imported ${imported.length} eligible ETFs`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#1d2528]">
      <section className="border-b border-[#d9d0c1] bg-[#f7f4ee]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-[#7b4a23]">Agentic Trading</p>
              <h1 className="mt-1 text-3xl font-semibold text-[#182326] sm:text-4xl">
                Strategy 2: ETF Inception Backtester
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#586064]">
                Each eligible ETF is tested from its first available daily price by default.
                The rules enter after lower-band/oversold signals and step aside after upper-band/overbought signals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`control-button ${period === option.value ? "active" : ""}`}
                  onClick={() => setPeriod(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
              <button
                className="primary-button"
                disabled={isLoading || !selectedEtf}
                onClick={() => selectedEtf && fetchHistory(selectedEtf.symbol, period)}
                type="button"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Metric label="ETF strategies" value={String(eligibleUniverse.length)} />
            <Metric label="Test window" value={selectedRunLabel} />
            <Metric label="Latest signal" value={signalLabel(result.latestSignal?.signal)} tone={result.latestSignal?.signal} />
            <Metric label="Fit score" value={`${selectedSynthesis.score}/100`} tone={selectedSynthesis.tone} />
            <Metric label="Verdict" value={selectedSynthesis.grade} tone={selectedSynthesis.tone} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="space-y-4">
          <div className="panel">
            <label className="field-label" htmlFor="search">ETF universe</label>
            <input
              id="search"
              className="text-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search symbol, name, segment"
              value={query}
            />
            <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
              {filteredUniverse.map((etf) => (
                <button
                  className={`etf-row ${etf.symbol === selectedEtf?.symbol ? "selected" : ""}`}
                  key={`${etf.symbol}-${etf.segment}`}
                  onClick={() => selectAnalyzedEtf(etf.symbol)}
                  type="button"
                >
                  <span>
                    <strong>{etf.symbol}</strong>
                    <small>{etf.segment}</small>
                  </span>
                  <span className="etf-row-metrics">
                    <small>{comparisonRuns[etf.symbol]?.range === period ? comparisonRuns[etf.symbol]?.synthesis?.grade ?? "Run" : "Run"}</small>
                    <b>{comparisonRuns[etf.symbol]?.range === period ? comparisonRuns[etf.symbol]?.synthesis?.score ?? `${etf.stockCount} stk` : `${etf.stockCount} stk`}</b>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <form className="space-y-3" onSubmit={addCustomEtf}>
              <label className="field-label">Add ETF</label>
              <input className="text-input" name="symbol" placeholder="Ticker" />
              <input className="text-input" name="name" placeholder="Name" />
              <input className="text-input" min="11" name="stockCount" placeholder="Stock count" type="number" />
              <button className="secondary-button w-full" type="submit">Add strategy</button>
            </form>
            <label className="mt-4 block">
              <span className="field-label">Import CSV</span>
              <input className="file-input" onChange={importUniverse} type="file" accept=".csv,text/csv" />
            </label>
          </div>
        </aside>

        <div className="space-y-5">
          <section className="panel">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#7b4a23]">{selectedEtf?.segment}</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedEtf?.symbol} · {selectedEtf?.name}</h2>
                <p className="mt-1 text-sm text-[#667074]">{selectedEtf?.stockCount} stocks in holdings metadata · {status}</p>
                {error ? <p className="mt-2 text-sm font-medium text-[#a33b28]">{error}</p> : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:w-[620px] xl:grid-cols-4">
                <Metric label={period === "max" ? "CAGR since inception" : "CAGR"} value={percent(result.cagr)} />
                <Metric label="First price date" value={result.startDate ?? "—"} />
                <Metric label="Years tested" value={result.testedYears ? result.testedYears.toFixed(1) : "—"} />
                <Metric label="CAGR vs hold" value={percent(result.cagr - result.buyHoldCagr)} />
              </div>
            </div>

            <div className={`synthesis-card ${selectedSynthesis.tone}`}>
              <div>
                <span className="synthesis-score">{selectedSynthesis.score}</span>
                <span className="synthesis-grade">{selectedSynthesis.grade}</span>
              </div>
              <div>
                <h3>{selectedSynthesis.verdict}</h3>
                <div className="synthesis-grid">
                  <RunNote label="Edge" value={selectedSynthesis.edge} />
                  <RunNote label="Risk" value={selectedSynthesis.risk} />
                  <RunNote label="Activity" value={selectedSynthesis.activity} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_300px]">
              <StrategyChart points={result.points} />
              <div className="settings-grid">
                <NumberField label="BB period" value={settings.bbPeriod} min={5} max={100} onChange={(value) => updateSetting("bbPeriod", value)} />
                <NumberField label="Band stdev" value={settings.bbDeviations} min={1} max={4} step={0.25} onChange={(value) => updateSetting("bbDeviations", value)} />
                <NumberField label="RSI period" value={settings.rsiPeriod} min={2} max={50} onChange={(value) => updateSetting("rsiPeriod", value)} />
                <NumberField label="Overbought" value={settings.overbought} min={50} max={95} onChange={(value) => updateSetting("overbought", value)} />
                <NumberField label="Oversold" value={settings.oversold} min={5} max={50} onChange={(value) => updateSetting("oversold", value)} />
                <NumberField label="Initial cash" value={settings.initialCash} min={1000} max={10000000} step={1000} onChange={(value) => updateSetting("initialCash", value)} />
                <label className="field-label">
                  Position mode
                  <select
                    className="text-input mt-1"
                    value={settings.mode}
                    onChange={(event) => updateSetting("mode", event.target.value)}
                  >
                    <option value="long-cash">Long / cash</option>
                    <option value="long-short">Long / short</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">ETF Strategy Scoreboard</h3>
                <p className="mt-1 text-sm text-[#667074]">
                  {analyzedCount} of {filteredUniverse.length} visible ETFs backtested · {batchStatus}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="compact-label">
                  Backtest first
                  <select
                    className="compact-select"
                    value={comparisonLimit}
                    onChange={(event) => setComparisonLimit(Number(event.target.value))}
                  >
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={36}>36</option>
                    <option value={72}>72</option>
                  </select>
                </label>
                <button
                  className="primary-button"
                  disabled={isAnalyzingUniverse}
                  onClick={analyzeVisibleUniverse}
                  type="button"
                >
                  {isAnalyzingUniverse ? "Backtesting" : period === "max" ? "Backtest since inception" : `Backtest ${period.toUpperCase()}`}
                </button>
              </div>
            </div>
            <div className="scoreboard-list">
              {rankedUniverse.slice(0, comparisonLimit).map((etf) => (
                <ScoreboardRow
                  etf={etf}
                  isSelected={etf.symbol === selectedEtf?.symbol}
                  key={`${etf.symbol}-scoreboard`}
                  onAnalyze={() => analyzeOneEtf(etf.symbol)}
                  onSelect={() => selectAnalyzedEtf(etf.symbol)}
                  run={comparisonRuns[etf.symbol]?.range === period ? comparisonRuns[etf.symbol] : undefined}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="panel">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Signal Log</h3>
                <span className="text-sm text-[#667074]">{result.signalCount} completed signals</span>
              </div>
              <div className="mt-3 max-h-[390px] overflow-auto">
                <table className="signal-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Signal</th>
                      <th>Close</th>
                      <th>RSI</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.points.filter((point) => point.signal !== "neutral" && point.signal !== "warmup").slice(-80).reverse().map((point) => (
                      <tr key={`${point.date}-${point.signal}`}>
                        <td>{point.date}</td>
                        <td><span className={`signal-pill ${point.signal}`}>{signalLabel(point.signal)}</span></td>
                        <td>{currency(point.close)}</td>
                        <td>{point.rsi?.toFixed(1)}</td>
                        <td>{point.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="panel space-y-3">
              <h3 className="text-lg font-semibold">Run Notes</h3>
              <RunNote label="Backtest window" value={`${selectedRunLabel}; ${period === "max" ? "Yahoo max history is requested so each ETF starts at its first available adjusted daily bar." : "Use Since inception to test the full available history for each ETF."}`} />
              <RunNote label="Signal timing" value="Indicators use completed daily candles; allocation changes on the next close." />
              <RunNote label="Touch rule" value="Upper band uses high >= upper band; lower band uses low <= lower band." />
              <RunNote label="Exposure" value={`${percent(result.exposure)} in active long or short exposure.`} />
              <RunNote label="Data" value="OHLC prices are adjusted from Yahoo chart history when adjusted close is available." />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: MetricTone }) {
  return (
    <div className={`metric ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScoreboardRow({
  etf,
  run,
  isSelected,
  onAnalyze,
  onSelect,
}: {
  etf: EtfProfile;
  run?: CachedRun;
  isSelected: boolean;
  onAnalyze: () => void;
  onSelect: () => void;
}) {
  const result = run?.result;
  const synthesis = run?.synthesis;
  return (
    <div
      className={`scoreboard-row ${isSelected ? "selected" : ""} ${synthesis?.tone ?? ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="scoreboard-title">
        <strong>{etf.symbol}</strong>
        <span>{etf.name}</span>
      </div>
      <div className="score-cell verdict">
        <b className={`verdict-pill ${synthesis?.tone ?? "empty"}`}>{synthesis?.grade ?? statusLabel(run?.status)}</b>
        <span>{synthesis ? `${synthesis.score}/100` : etf.segment}</span>
      </div>
      <MiniSparkline points={result?.points ?? []} tone={synthesis?.tone ?? "empty"} />
      <div className="score-driver">{synthesis?.driver ?? "Run this ETF to score the strategy."}</div>
      <div className="score-cell">
        <b>{result ? percent(result.cagr) : "—"}</b>
        <span>CAGR</span>
      </div>
      <div className="score-cell">
        <b>{result?.startDate ?? "—"}</b>
        <span>Start</span>
      </div>
      <div className="score-cell">
        <b>{result?.testedYears ? result.testedYears.toFixed(1) : "—"}</b>
        <span>Years</span>
      </div>
      <div className="score-cell">
        <b>{result ? percent(result.buyHoldCagr) : "—"}</b>
        <span>Hold CAGR</span>
      </div>
      <div className="score-cell">
        <b>{result ? percent(result.maxDrawdown) : "—"}</b>
        <span>Worst drop</span>
      </div>
      <div className="score-cell">
        <b>{result ? signalLabel(result.latestSignal?.signal) : "—"}</b>
        <span>Signal</span>
      </div>
      <button
        className="control-button"
        disabled={run?.status === "loading"}
        onClick={(event) => {
          event.stopPropagation();
          onAnalyze();
        }}
        type="button"
      >
        {run?.status === "loading" ? "Loading" : "Run"}
      </button>
    </div>
  );
}

function MiniSparkline({
  points,
  tone,
}: {
  points: BacktestPoint[];
  tone: StrategySynthesis["tone"];
}) {
  if (points.length < 2) {
    return <div className="mini-sparkline empty" aria-label="No equity sparkline yet" />;
  }
  const width = 96;
  const height = 30;
  const values = points.map((point) => point.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const path = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = scale(value, min, max, height - 3, 3);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className={`mini-sparkline ${tone}`} viewBox={`0 0 ${width} ${height}`} aria-label="Equity sparkline" role="img">
      <path d={path} fill="none" strokeWidth="2.25" />
    </svg>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field-label">
      {label}
      <input
        className="text-input mt-1"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function RunNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="run-note">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function StrategyChart({ points }: { points: BacktestPoint[] }) {
  if (points.length < 2) {
    return <div className="chart-empty">Load an ETF to render the backtest.</div>;
  }
  const width = 860;
  const height = 420;
  const pad = 26;
  const equityValues = points.map((point) => point.equity);
  const priceValues = points.map((point) => point.close);
  const equityMin = Math.min(...equityValues);
  const equityMax = Math.max(...equityValues);
  const priceMin = Math.min(...priceValues);
  const priceMax = Math.max(...priceValues);
  const x = (index: number) => pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const yEquity = (value: number) => scale(value, equityMin, equityMax, height - pad, pad);
  const yPrice = (value: number) => scale(value, priceMin, priceMax, height - pad, pad);
  const equityPath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yEquity(point.equity)}`).join(" ");
  const pricePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yPrice(point.close)}`).join(" ");
  const signalPoints = points
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.signal === "bullish" || point.signal === "bearish")
    .slice(-80);

  return (
    <div className="chart-shell">
      <svg aria-label="Backtest equity and ETF price chart" viewBox={`0 0 ${width} ${height}`} role="img">
        <rect width={width} height={height} rx="8" fill="#fffdf8" />
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={pad}
            x2={width - pad}
            y1={pad + line * ((height - pad * 2) / 3)}
            y2={pad + line * ((height - pad * 2) / 3)}
            stroke="#e4dccf"
            strokeWidth="1"
          />
        ))}
        <path d={pricePath} fill="none" stroke="#78909c" strokeOpacity="0.45" strokeWidth="2" />
        <path d={equityPath} fill="none" stroke="#236c6f" strokeWidth="3" />
        {signalPoints.map(({ point, index }) => (
          <circle
            cx={x(index)}
            cy={yEquity(point.equity)}
            fill={point.signal === "bullish" ? "#2f7d55" : "#b14b3b"}
            key={`${point.date}-${point.signal}-${index}`}
            r="4"
          />
        ))}
      </svg>
      <div className="chart-legend">
        <span><i className="legend equity" /> Equity</span>
        <span><i className="legend price" /> ETF price</span>
        <span><i className="legend bullish" /> Bullish</span>
        <span><i className="legend bearish" /> Bearish</span>
      </div>
    </div>
  );
}

function runBacktest(bars: Bar[], settings: typeof DEFAULT_SETTINGS): BacktestResult {
  if (bars.length < Math.max(settings.bbPeriod, settings.rsiPeriod) + 2) {
    return emptyResult(settings.initialCash);
  }

  const startDate = bars[0]?.date ?? null;
  const endDate = bars.at(-1)?.date ?? null;
  const testedYears = calendarYearsBetween(startDate, endDate) || (bars.length - 1) / 252;
  const closes = bars.map((bar) => bar.close);
  const bands = bollingerBands(closes, settings.bbPeriod, settings.bbDeviations);
  const rsiValues = rsiWilder(closes, settings.rsiPeriod);
  let equity = settings.initialCash;
  let peak = equity;
  let maxDrawdown = 0;
  let position = 0;
  let trades = 0;
  let activeDays = 0;
  const returns: number[] = [];
  const points: BacktestPoint[] = [];

  for (let index = 0; index < bars.length; index += 1) {
    const bar = bars[index];
    const band = bands[index];
    const rsi = rsiValues[index];
    const signal = classifySignal(bar, band, rsi, settings);
    const reason = signalReason(signal, band, rsi, settings);

    if (index > 0) {
      const previous = bars[index - 1];
      const dailyReturn = (bar.close / previous.close) - 1;
      const strategyReturn = position * dailyReturn;
      equity *= 1 + strategyReturn;
      returns.push(strategyReturn);
      if (position !== 0) activeDays += 1;
      peak = Math.max(peak, equity);
      maxDrawdown = Math.min(maxDrawdown, equity / peak - 1);
    }

    points.push({
      date: bar.date,
      close: bar.close,
      equity,
      position,
      signal,
      rsi,
      upper: band?.upper ?? null,
      lower: band?.lower ?? null,
      reason,
    });

    const nextPosition = nextPositionForSignal(signal, position, settings.mode);
    if (nextPosition !== position && signal !== "warmup") {
      trades += 1;
      position = nextPosition;
    }
  }

  const years = testedYears || returns.length / 252;
  const cagr = years > 0 ? (equity / settings.initialCash) ** (1 / years) - 1 : 0;
  const signalPoints = points.filter((point) => point.signal === "bullish" || point.signal === "bearish");
  const buyHoldReturn = (bars.at(-1)?.close ?? 0) / (bars[0]?.close ?? 1) - 1;
  const buyHoldCagr = years > 0 ? (1 + buyHoldReturn) ** (1 / years) - 1 : 0;
  const buyHoldMaxDrawdown = maxDrawdownForValues(closes);
  const totalReturn = equity / settings.initialCash - 1;

  return {
    points,
    startDate,
    endDate,
    tradingDays: returns.length,
    testedYears,
    finalEquity: equity,
    cagr,
    sharpe: annualizedSharpe(returns),
    maxDrawdown,
    totalReturn,
    buyHoldReturn,
    buyHoldCagr,
    buyHoldMaxDrawdown,
    alphaVsBuyHold: totalReturn - buyHoldReturn,
    trades,
    exposure: returns.length ? activeDays / returns.length : 0,
    latestSignal: signalPoints.at(-1) ?? points.at(-1) ?? null,
    signalCount: signalPoints.length,
  };
}

function emptyResult(initialCash: number): BacktestResult {
  return {
    points: [],
    startDate: null,
    endDate: null,
    tradingDays: 0,
    testedYears: 0,
    finalEquity: initialCash,
    cagr: 0,
    sharpe: 0,
    maxDrawdown: 0,
    totalReturn: 0,
    buyHoldReturn: 0,
    buyHoldCagr: 0,
    buyHoldMaxDrawdown: 0,
    alphaVsBuyHold: 0,
    trades: 0,
    exposure: 0,
    latestSignal: null,
    signalCount: 0,
  };
}

function synthesizeStrategy(result: BacktestResult): StrategySynthesis {
  if (result.points.length < 2) {
    return {
      score: 0,
      grade: "No run",
      tone: "empty",
      verdict: "Run an ETF to synthesize this strategy.",
      edge: "No price history has been loaded yet.",
      risk: "Drawdown and volatility are unavailable.",
      activity: "Signals will appear after the first completed run.",
      driver: "No backtest yet.",
    };
  }

  const tradesPerYear = result.points.length > 1 ? result.trades / ((result.points.length - 1) / 252) : 0;
  const sharpeScore = clamp((result.sharpe - 0.25) / 0.75, 0, 1);
  const returnScore =
    0.6 * clamp((result.cagr - 0.02) / 0.08, 0, 1) +
    0.4 * clamp((result.cagr - result.buyHoldCagr + 0.02) / 0.07, 0, 1);
  const drawdownScore =
    0.6 * clamp((0.35 - Math.abs(result.maxDrawdown)) / 0.25, 0, 1) +
    0.4 * clamp((Math.abs(result.buyHoldMaxDrawdown) - Math.abs(result.maxDrawdown)) / 0.2, 0, 1);
  const activityScore = activityScoreFor(tradesPerYear, result.exposure);
  const currentSignalScore = currentSignalScoreFor(result.latestSignal, result.points.at(-1)?.date);
  const rawScore = Math.round(
    100 *
      (
        0.3 * sharpeScore +
        0.25 * returnScore +
        0.25 * drawdownScore +
        0.1 * activityScore +
        0.1 * currentSignalScore
      ),
  );
  const score = Math.min(
    rawScore,
    result.cagr <= 0 ? 44 : result.alphaVsBuyHold < 0 ? 68 : Math.abs(result.maxDrawdown) > 0.4 ? 44 : 100,
  );
  const insufficient = result.points.length < 252 || result.signalCount < 3;
  const hasClearEdge = result.cagr > 0 && result.alphaVsBuyHold >= 0;
  const tone = insufficient ? "mixed" : score >= 75 && hasClearEdge ? "strong" : score >= 60 ? "good" : score >= 45 ? "mixed" : "weak";
  const grade = insufficient
    ? "Thin data"
    : score >= 75 && hasClearEdge
      ? "Strong edge"
    : score >= 60
        ? "Tradable"
        : score >= 45
          ? "Watchlist"
          : "Reject";
  const latestSignal = signalLabel(result.latestSignal?.signal).toLowerCase();
  const verdict =
    insufficient
      ? "There is not enough signal history yet; treat this as provisional."
      : score >= 75 && hasClearEdge
      ? "The mean-reversion rules have shown a strong historical fit here."
      : score >= 60
        ? result.alphaVsBuyHold < 0
          ? "The rules are risk-adjusted tradable, but still lag buy-and-hold in this window."
          : "The rules look usable, with a positive but selective profile."
        : score >= 45
          ? "The rules are mixed; inspect risk and signal timing before trusting it."
          : "The rules have not shown enough edge for this ETF in the selected window.";

  return {
    score,
    grade,
    tone,
    verdict,
    edge: `${percent(result.cagr)} CAGR vs ${percent(result.buyHoldCagr)} buy-and-hold CAGR; ${percent(result.cagr - result.buyHoldCagr)} annualized difference.`,
    risk: `${percent(result.maxDrawdown)} strategy max drawdown vs ${percent(result.buyHoldMaxDrawdown)} buy-and-hold; Sharpe ${number(result.sharpe)}.`,
    activity: `${result.testedYears.toFixed(1)} tested years, ${tradesPerYear.toFixed(1)} trades/year, ${result.signalCount} signals, ${percent(result.exposure)} exposure; latest signal is ${latestSignal}.`,
    driver: `${result.startDate ?? "Start"} · CAGR ${percent(result.cagr)} vs hold ${percent(result.buyHoldCagr)} · Worst drop ${percent(result.maxDrawdown)}`,
  };
}

function classifySignal(
  bar: Bar,
  band: { upper: number; lower: number } | null,
  rsi: number | null,
  settings: typeof DEFAULT_SETTINGS,
): Signal {
  if (!band || rsi === null) return "warmup";
  if (bar.high >= band.upper && rsi > settings.overbought) return "bearish";
  if (bar.low <= band.lower && rsi < settings.oversold) return "bullish";
  return "neutral";
}

function signalReason(
  signal: Signal,
  band: { upper: number; lower: number } | null,
  rsi: number | null,
  settings: typeof DEFAULT_SETTINGS,
) {
  if (signal === "warmup") return "insufficient indicator history";
  if (signal === "bearish") return `high touched upper band and RSI ${rsi?.toFixed(1)} > ${settings.overbought}`;
  if (signal === "bullish") return `low touched lower band and RSI ${rsi?.toFixed(1)} < ${settings.oversold}`;
  if (!band || rsi === null) return "neutral";
  return "no touch-plus-RSI confirmation";
}

function nextPositionForSignal(signal: Signal, current: number, mode: string) {
  if (signal === "bullish") return 1;
  if (signal === "bearish") return mode === "long-short" ? -1 : 0;
  return current;
}

function bollingerBands(values: number[], period: number, deviations: number) {
  return values.map((_, index) => {
    if (index < period - 1) return null;
    const window = values.slice(index - period + 1, index + 1);
    const mean = window.reduce((sum, value) => sum + value, 0) / period;
    const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
    const stdev = Math.sqrt(variance);
    return {
      upper: mean + deviations * stdev,
      lower: mean - deviations * stdev,
    };
  });
}

function rsiWilder(values: number[], period: number) {
  const result: Array<number | null> = Array(values.length).fill(null);
  if (values.length <= period) return result;
  let avgGain = 0;
  let avgLoss = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    avgGain += Math.max(change, 0);
    avgLoss += Math.max(-change, 0);
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = rsiFromAverages(avgGain, avgLoss);
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
    result[index] = rsiFromAverages(avgGain, avgLoss);
  }
  return result;
}

function rsiFromAverages(avgGain: number, avgLoss: number) {
  if (avgGain === 0 && avgLoss === 0) return 50;
  if (avgLoss === 0) return 100;
  if (avgGain === 0) return 0;
  const relativeStrength = avgGain / avgLoss;
  return 100 - 100 / (1 + relativeStrength);
}

function annualizedSharpe(returns: number[]) {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1);
  return variance === 0 ? 0 : (mean / Math.sqrt(variance)) * Math.sqrt(252);
}

function maxDrawdownForValues(values: number[]) {
  if (!values.length) return 0;
  let peak = values[0];
  let drawdown = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    drawdown = Math.min(drawdown, value / peak - 1);
  }
  return drawdown;
}

function activityScoreFor(tradesPerYear: number, exposure: number) {
  const tradeScore =
    tradesPerYear >= 1 && tradesPerYear <= 12
      ? 1
      : tradesPerYear < 1
        ? clamp(tradesPerYear, 0, 1)
        : clamp(1 - (tradesPerYear - 12) / 24, 0, 1);
  const exposureScore =
    exposure >= 0.1 && exposure <= 0.8
      ? 1
      : exposure < 0.1
        ? clamp(exposure / 0.1, 0, 1)
        : clamp(1 - (exposure - 0.8) / 0.2, 0, 1);
  return (tradeScore + exposureScore) / 2;
}

function currentSignalScoreFor(latestSignal: BacktestPoint | null, latestDate?: string) {
  if (!latestSignal || !latestDate) return 0.2;
  if (latestSignal.signal === "neutral") return 0.6;
  if (latestSignal.signal === "warmup") return 0.2;
  const latestTime = Date.parse(latestDate);
  const signalTime = Date.parse(latestSignal.date);
  if (!Number.isFinite(latestTime) || !Number.isFinite(signalTime)) return 0.6;
  const daysOld = (latestTime - signalTime) / (24 * 60 * 60 * 1000);
  return daysOld <= 14 ? 1 : daysOld <= 45 ? 0.6 : 0.35;
}

function calendarYearsBetween(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return 0;
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / (365.25 * 24 * 60 * 60 * 1000);
}

function rangeCopy(range: string) {
  if (range === "max" || range === "inception") return "since inception";
  return `over ${range.toUpperCase()}`;
}

function runWindowLabel(result: BacktestResult) {
  if (!result.startDate || !result.endDate || !result.testedYears) return "Not loaded";
  return `${result.testedYears.toFixed(1)} yrs · ${result.startDate} to ${result.endDate}`;
}

function scale(value: number, min: number, max: number, outputMax: number, outputMin: number) {
  if (max === min) return (outputMin + outputMax) / 2;
  return outputMax - ((value - min) / (max - min)) * (outputMax - outputMin);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function statusLabel(status?: CachedRun["status"]) {
  if (status === "loading") return "Loading";
  if (status === "error") return "Error";
  return "Not run";
}

function signalLabel(signal?: Signal) {
  if (signal === "bullish") return "Bullish";
  if (signal === "bearish") return "Bearish";
  if (signal === "warmup") return "Warmup";
  if (signal === "neutral") return "Neutral";
  return "None";
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function percent(value: number) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function number(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}
