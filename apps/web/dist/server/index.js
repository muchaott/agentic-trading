const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Strategy Ledger Test</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f8f6;
        --panel: #ffffff;
        --ink: #171a1f;
        --muted: #5f6673;
        --line: #d9ddd5;
        --accent: #0f766e;
        --danger: #9f1239;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        margin: 0 auto;
        max-width: 1120px;
        padding: clamp(28px, 5vw, 72px) clamp(18px, 4vw, 56px);
      }
      header {
        align-items: center;
        border-bottom: 1px solid var(--line);
        display: flex;
        justify-content: space-between;
        padding: 18px clamp(18px, 4vw, 56px);
      }
      .brand { font-size: 18px; font-weight: 800; }
      .status {
        background: #ecfdf5;
        border-radius: 999px;
        color: #047857;
        display: inline-flex;
        font-size: 12px;
        font-weight: 800;
        padding: 6px 10px;
        text-transform: uppercase;
      }
      .hero {
        display: grid;
        gap: 24px;
        grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
      }
      h1 {
        font-size: clamp(42px, 7vw, 72px);
        letter-spacing: 0;
        line-height: 0.96;
        margin: 18px 0;
      }
      h2 { font-size: 30px; margin: 0 0 14px; }
      p { color: var(--muted); font-size: 17px; line-height: 1.65; }
      .panel, .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 22px;
      }
      .grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: 32px;
      }
      .metric-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .metric {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
      }
      .metric span {
        color: var(--muted);
        display: block;
        font-size: 12px;
        font-weight: 750;
        text-transform: uppercase;
      }
      .metric strong {
        display: block;
        font-size: 28px;
        margin-top: 6px;
      }
      .notice {
        border-left: 4px solid var(--danger);
        margin-top: 22px;
        padding: 12px 14px;
      }
      .button {
        background: var(--accent);
        border-radius: 8px;
        color: #fff;
        display: inline-flex;
        font-weight: 750;
        margin-top: 10px;
        padding: 12px 16px;
        text-decoration: none;
      }
      @media (max-width: 860px) {
        header, .hero { align-items: flex-start; grid-template-columns: 1fr; }
        header { flex-direction: column; gap: 10px; }
        .grid, .metric-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="brand">Strategy Ledger</div>
      <div class="status">Public test site</div>
    </header>
    <main>
      <section class="hero">
        <div>
          <div class="status">Setup works</div>
          <h1>Reviewed ETF strategy research.</h1>
          <p>
            This public smoke-test deployment proves the website product can be hosted
            and shared without vendor secrets. The production app remains designed
            around immutable research artifacts, review gates, and clear risk disclosures.
          </p>
          <a class="button" href="https://github.com/muchaott/agentic-trading/tree/codex/website-product-workstream">View repo branch</a>
        </div>
        <div class="panel">
          <h2>SPY Mean-Reversion Demo</h2>
          <p>Prototype-only fixture for testing the product surface. Not investment advice.</p>
          <div class="metric-grid">
            <div class="metric"><span>CAGR</span><strong>8.7%</strong></div>
            <div class="metric"><span>Max drawdown</span><strong>-18.8%</strong></div>
            <div class="metric"><span>Trades</span><strong>72</strong></div>
            <div class="metric"><span>Win rate</span><strong>53.0%</strong></div>
          </div>
          <p class="notice">
            This is a public test page only. Live signals, paid access, and production
            market-data claims remain blocked on legal, compliance, and vendor licensing review.
          </p>
        </div>
      </section>
      <section class="grid" aria-label="Foundation checks">
        <div class="card"><h2>Next app</h2><p>Production app source exists under apps/web with TypeScript and a successful local build.</p></div>
        <div class="card"><h2>Supabase plan</h2><p>Schema is ready for artifacts, reviews, waitlist entries, roles, and audit logs.</p></div>
        <div class="card"><h2>Vendor path</h2><p>Tiingo, EODHD, Resend, Plausible, Sentry, Supabase, and Vercel/Sites setup items are documented.</p></div>
      </section>
    </main>
  </body>
</html>`;

export default {
  async fetch() {
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60"
      }
    });
  }
};
