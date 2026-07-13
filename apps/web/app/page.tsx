import { ArtifactCard } from "@/components/artifact-card";
import { WaitlistForm } from "@/components/waitlist-form";
import { getFeaturedArtifacts } from "@/lib/artifacts";

export default async function HomePage() {
  const artifacts = await getFeaturedArtifacts();
  const featured = artifacts[0];

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>Reviewed ETF strategy research.</h1>
          <p>
            Strategy Ledger publishes methodology-first ETF research from
            immutable artifacts. Every public result should trace back to a data
            snapshot, rule version, assumptions, disclosure, and review record.
          </p>
          <div className="actions">
            <a className="button" href="/research">
              View research catalog
            </a>
            <a className="button secondary" href="#waitlist">
              Join waitlist
            </a>
          </div>
        </div>
        <div className="panel">
          <p className="status draft">{featured.publication_state}</p>
          <h2>{featured.research_report.title}</h2>
          <p className="muted">{featured.research_report.summary}</p>
          <div className="metric-grid" aria-label="Featured research metrics">
            <div className="metric">
              <span>CAGR</span>
              <strong>{formatPercent(featured.metric_snapshot.cagr)}</strong>
            </div>
            <div className="metric">
              <span>Max drawdown</span>
              <strong>{formatPercent(featured.metric_snapshot.max_drawdown)}</strong>
            </div>
            <div className="metric">
              <span>Trades</span>
              <strong>{featured.metric_snapshot.trade_count}</strong>
            </div>
            <div className="metric">
              <span>Win rate</span>
              <strong>{formatPercent(featured.metric_snapshot.win_rate)}</strong>
            </div>
          </div>
          <p className="notice risk">
            Prototype-only fixture. Not investment advice and not a production
            performance claim.
          </p>
        </div>
      </section>

      <section className="section" id="methodology">
        <h2>MVP foundation</h2>
        <div className="grid">
          <div className="card">
            <h3>Artifact first</h3>
            <p className="muted">
              The website consumes precomputed research artifacts. It does not
              run strategy code or arbitrary backtests at request time.
            </p>
          </div>
          <div className="card">
            <h3>Review gated</h3>
            <p className="muted">
              Production publication requires quant review, compliance review,
              data-rights approval, and immutable hashes.
            </p>
          </div>
          <div className="card">
            <h3>Vendor ready</h3>
            <p className="muted">
              The app is prepared for Supabase, Tiingo, EODHD, Resend,
              Plausible, Sentry, and Vercel deployment.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="risk">
        <h2>Risk posture</h2>
        <p className="notice risk">
          MVP should stay research-only. Paid subscriptions, live signals,
          personalized recommendations, and broker integrations remain blocked
          until legal, compliance, and market-data licensing review are complete.
        </p>
      </section>

      <section className="section" id="waitlist">
        <h2>Join the waitlist</h2>
        <WaitlistForm />
      </section>
    </main>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
