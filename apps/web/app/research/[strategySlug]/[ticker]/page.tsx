import { notFound } from "next/navigation";
import { getArtifactByRoute } from "@/lib/artifacts";

type Props = {
  params: Promise<{
    strategySlug: string;
    ticker: string;
  }>;
};

export default async function ResearchReportPage({ params }: Props) {
  const { strategySlug, ticker } = await params;
  const artifact = await getArtifactByRoute(strategySlug, ticker);

  if (!artifact) {
    notFound();
  }

  return (
    <main>
      <section className="section">
        <p className={`status ${artifact.publication_state}`}>{artifact.publication_state}</p>
        <h1>{artifact.research_report.title}</h1>
        <p className="muted">{artifact.research_report.summary}</p>

        <div className="grid">
          <div className="card">
            <h3>Instrument</h3>
            <p>{artifact.instrument.ticker}</p>
            <p className="muted">{artifact.instrument.name}</p>
          </div>
          <div className="card">
            <h3>Rule version</h3>
            <p>{artifact.strategy_rule_version.rule_version_id}</p>
            <p className="muted">{artifact.strategy_rule_version.rule_text}</p>
          </div>
          <div className="card">
            <h3>Data snapshot</h3>
            <p>{artifact.data_snapshot.snapshot_id}</p>
            <p className="muted">
              {artifact.data_snapshot.vendor} as of {artifact.data_snapshot.as_of_date}
            </p>
          </div>
        </div>

        <div className="panel section">
          <h2>Metrics</h2>
          <div className="metric-grid">
            <Metric label="CAGR" value={formatPercent(artifact.metric_snapshot.cagr)} />
            <Metric label="Total return" value={formatPercent(artifact.metric_snapshot.total_return)} />
            <Metric label="Max drawdown" value={formatPercent(artifact.metric_snapshot.max_drawdown)} />
            <Metric label="Benchmark return" value={formatPercent(artifact.metric_snapshot.benchmark_return)} />
            <Metric label="Turnover" value={`${artifact.metric_snapshot.turnover.toFixed(1)}x`} />
            <Metric label="Trade count" value={`${artifact.metric_snapshot.trade_count}`} />
          </div>
        </div>

        <div className="notice risk section">
          {artifact.disclosure.no_advice_text} {artifact.disclosure.no_guarantee_text}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
