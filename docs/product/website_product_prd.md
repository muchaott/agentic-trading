# PRD: ETF Strategy Research Website

Status: Revised draft after two-PM review  
Date: 2026-07-11  
Workstream: Website product only  
Owner: Product / engineering review

## Executive Summary

The original concept was a website storefront where users subscribe to trading strategies and receive signals. The revised MVP should be a trust-first ETF strategy research website, not a paid live-signal marketplace.

The product should help self-directed investors evaluate rules-based ETF strategy research through transparent methodology, standardized historical analysis, risk metrics, and clear disclosures. The MVP should not provide personalized advice, execute trades, sell paid live actionable signals, or create new strategies inside the website workstream.

This keeps the first product build focused, credible, and safer while preserving a future path toward subscriptions if legal, data, and methodology gates are cleared.

## Working Names

Avoid names that imply guaranteed wealth creation, such as "AutoWealth."

Better working-name directions:

- Strategy Ledger
- ETF Signal Lab
- SignalShelf
- StrategyFoundry
- EdgeLab
- SignalWise Research

Current PRD name: ETF Strategy Research Website.

## Product Thesis

Self-directed ETF investors want systematic strategy ideas, but most signal products are opaque, overstate returns, or hide risk. A transparent research platform can earn trust by showing how each strategy works, how it performed historically, where it failed, what assumptions were used, and whether the results are hypothetical, paper-live, or live.

## Target User

Primary user:

- Sophisticated self-directed ETF investor
- Understands that trading involves risk
- Wants to compare systematic ETF strategy research without building indicators and backtests from scratch
- Cares about methodology, drawdowns, assumptions, and benchmark comparison

Not the initial target:

- Beginner investors seeking guaranteed returns
- Users looking for personalized financial advice
- Users expecting automated brokerage execution
- Users looking for get-rich-quick signals

## Positioning

Recommended positioning:

"A transparent research platform for self-directed investors to evaluate rules-based ETF strategies using standardized historical analysis, risk metrics, and clear methodology."

Avoid:

- "Auto wealth"
- "Guaranteed returns"
- "Best strategy"
- "Highest APY"
- "Buy/sell alerts that beat the market"
- Any copy implying personalized investment advice

## Goals

1. Help users discover and evaluate a small set of approved ETF strategy variants.
2. Present historical performance in a transparent, standardized, risk-forward way.
3. Validate whether users trust the research enough to join a waitlist or express pricing intent.
4. Build a product architecture that can later support subscriptions if legal and compliance gates are cleared.
5. Keep website product work separate from strategy creation and quant research work.

## Non-Goals

MVP will not include:

- Paid live trading-signal subscriptions
- Personalized investment advice
- Broker connection or trade execution
- Auto-trading
- Strategy generation
- Advanced proprietary strategy marketplace
- All-ETF coverage
- Public current buy/sell/hold calls
- Parameter optimization tools
- Return leaderboards
- Testimonials or social proof based on performance claims
- Mobile app

## MVP Scope

### Included

- Public landing page with conservative research positioning
- Research catalog for a limited ETF universe
- One baseline mean-reversion strategy family
- 5 to 10 approved ETF strategy variants
- Strategy detail/report pages
- Fixed-assumption backtest viewer
- Methodology page
- Data sources and assumptions page
- Risk/disclosures page
- Email capture and pricing-interest capture
- Internal admin/review workflow for publishing research

### Deferred

- Paid subscription checkout
- Real-time alert delivery
- Public current actionable signals
- Arbitrary ticker search
- Strategy parameter tuning
- Advanced/proprietary strategies
- Portfolio construction features
- Brokerage integrations

## Core User Flow

1. User lands on the site and sees the research value proposition.
2. User browses the ETF strategy research catalog.
3. User opens a strategy variant report.
4. User reviews methodology, historical performance, risks, assumptions, and benchmark comparison.
5. User explores constrained backtest views.
6. User joins the waitlist or expresses pricing interest.

## Information Architecture

P0 public pages:

- `/` Home and research catalog entry point
- `/research` Strategy research catalog
- `/research/:strategySlug/:ticker` Strategy variant report
- `/methodology` Backtest methodology and calculation rules
- `/data-sources` Data sources, delays, and assumptions
- `/risk-disclosures` Risks, limitations, conflicts, and hypothetical-performance disclosures
- `/waitlist` Email and pricing-interest capture

P0 internal pages:

- `/admin/research` Research artifact list
- `/admin/research/:id/review` Draft, quant review, compliance review, publish, archive

## Strategy Scope

MVP includes one strategy family:

Baseline ETF mean reversion research strategy.

Initial signal concept:

- Bullish research event: daily candle touches or closes near lower Bollinger Band and RSI is below 30.
- Bearish research event: daily candle touches or closes near upper Bollinger Band and RSI is above 70.

This is not yet a full strategy specification. Before publishing, the strategy rules must define:

- Indicator lookback periods
- Candle price used: close, high/low touch, or intraday touch
- Entry timing
- Exit timing
- Holding period
- Position sizing
- Long-only, short, or cash behavior
- Re-entry logic
- Transaction-cost assumption
- Slippage assumption
- Benchmark
- Signal timestamping
- Data adjustment method
- Strategy rule version

## ETF Universe

Do not use "all ETFs with more than 10 stocks" for MVP.

The launch universe should contain 5 to 10 U.S.-listed liquid ETFs selected by explicit criteria, for example:

- Sufficient trading history
- High average dollar volume
- Clear asset class/category
- Reliable adjusted price history
- No complex holdings that make the rule misleading
- Data redistribution rights confirmed

Candidate examples can be selected later, but the website product should not invent or validate the strategy universe. That belongs to the strategy research workstream.

## Catalog Requirements

Strategy catalog cards should show:

- Strategy family
- ETF ticker and name
- Research status: research, paper-live, live track record, retired
- Sample period
- Annualized return or CAGR
- Max drawdown
- Annualized volatility
- Benchmark comparison
- Trade count
- Assumptions label: gross, estimated net, fees/slippage included
- Data as-of date

Default sort:

- Recently updated or newest research

Allowed filters:

- ETF ticker
- ETF category
- Strategy family
- Research status
- Timeframe
- Benchmark
- Risk band

Avoid default sorting by highest return. If metric sorting is added, risk metrics must be equally visible.

## Strategy Report Requirements

Each strategy variant report must include:

- Plain-English summary
- Exact methodology and rule version
- ETF/instrument description
- Backtest sample period
- Benchmark comparison
- Equity curve
- Drawdown chart
- Monthly/yearly return view
- Gross vs estimated net performance
- Key risk metrics
- Trade count and turnover
- Worst month and worst year
- Recent historical research events
- Data freshness
- Assumptions and limitations
- Hypothetical/backtested performance label where applicable
- CTA for waitlist or pricing-interest capture

Drawdown and benchmark comparison should be at least as prominent as total return.

## Backtest Viewer Requirements

MVP should use precomputed, versioned backtest runs with limited user controls.

Allowed controls:

- Timeframe selection from approved windows
- Gross vs estimated net display
- Benchmark selection from approved benchmarks
- Initial capital display normalization

Not allowed in MVP:

- Arbitrary ticker search
- Indicator threshold tuning
- Bollinger/RSI parameter optimization
- "Find best strategy" workflows
- Free-form time-period mining
- User-uploaded strategy rules

Required metrics:

- CAGR / annualized return
- Total return
- Annualized volatility
- Max drawdown
- Benchmark return
- Excess return
- Sharpe or Sortino, if methodology is approved
- Turnover
- Trade count
- Win/loss distribution
- Worst month
- Worst year
- Fee assumption
- Slippage assumption
- Gross vs estimated net label
- Sample period
- Out-of-sample/live status

Do not use APY for trading-strategy performance.

## Data Model

Initial product data model:

- `Instrument`
- `StrategyFamily`
- `StrategyVariant`
- `StrategyRuleVersion`
- `MethodologyVersion`
- `UniverseSnapshot`
- `DataSource`
- `BacktestRun`
- `BacktestAssumption`
- `MetricSnapshot`
- `ResearchReport`
- `PerformancePresentation`
- `DisclosureVersion`
- `ContentReview`
- `UserAccount`
- `WaitlistInterest`

Future-only concepts:

- `Plan`
- `SubscriptionEntitlement`
- `SignalDelivery`
- `PaymentAccount`

## Content Review Workflow

Every public research artifact should move through:

1. Draft
2. Quant reviewed
3. Compliance reviewed
4. Published
5. Archived or retired

Every public page containing performance data should reference:

- Strategy rule version
- Backtest engine version
- Data source version or snapshot
- Assumptions version
- Disclosure version
- Reviewer and approval timestamp

## Trust And Disclosure Requirements

The product must make trust primitives first-class, not footer-only.

Every strategy/report page should show:

- Whether performance is hypothetical, paper-live, or live
- Whether results are gross or estimated net
- Data as-of date
- Known limitations
- Fee/slippage assumptions
- Benchmark
- Conflict disclosure
- No guarantee of future performance

Required standalone pages:

- Methodology
- Data sources
- Risks and limitations
- Conflicts
- Terms/disclosures

## Launch Gates

Do not launch paid signals or paid subscriptions until these are complete:

- Legal memo on adviser/newsletter/publisher status
- Data vendor and redistribution rights confirmed
- Backtest methodology reviewed for lookahead bias, survivorship bias, total return treatment, fees, slippage, and execution timing
- Disclosure templates approved
- Conflict policy documented, including founder/affiliate trading
- Incident process for stale, incorrect, or revised research
- Content review workflow implemented

## Success Metrics

MVP should optimize for trust and comprehension before monetization.

Primary metrics:

- Visitor to waitlist conversion
- Catalog to report click-through rate
- Report engagement depth
- Backtest viewer engagement
- Methodology page views
- Disclosure/risk page views
- Pricing-interest submissions
- User comprehension of backtested vs future performance

Secondary metrics:

- Return visits
- Email confirmation rate
- Qualitative feedback from target users
- Support questions or confusion themes

Do not use paid subscriber count as the primary MVP metric unless legal/compliance approval for paid access is complete.

## Pre-Engineering Validation

Before implementation starts, answer:

1. Is the first launch research-only, delayed-signal, or live-signal?
2. What legal/compliance posture will the product operate under?
3. Which data provider will be used, and what redistribution rights exist?
4. Which 5 to 10 ETFs are in the MVP universe?
5. What exact strategy rules are approved for publication?
6. Are backtests fully precomputed, computed on demand, or hybrid?
7. What disclosures must appear on every performance page?
8. What user action should the CTA optimize for: waitlist, pricing intent, account creation, or paid conversion?
9. Who approves methodology and performance claims before publication?
10. Will founders or affiliates trade the same ETFs/strategies?

## Future Phases

Phase 1: Research MVP

- Public research catalog
- Strategy reports
- Precomputed backtest viewer
- Waitlist and pricing-interest capture
- Internal review workflow

Phase 2: Account-Based Research

- User accounts
- Saved reports
- Watchlist
- Email updates about new research
- More strategy families after validation

Phase 3: Subscription Product

- Paid access to full reports or research updates
- Only after legal, compliance, data, and disclosure gates are complete

Phase 4: Signal Product

- Delayed or live signal delivery
- Only if legal posture and operating controls support it

## PM Council Recommendation

Build the website as a compliance-first ETF strategy research product with a future path to subscriptions. Do not launch the original "paid trading signal storefront" concept yet.

The highest-leverage next step is to finalize the research-only MVP scope and answer the pre-engineering validation questions. Once those are settled, engineering can build the website product without touching the strategy creation workstream.

