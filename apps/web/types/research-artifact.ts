export type PublicationState =
  | "draft"
  | "quant_reviewed"
  | "compliance_reviewed"
  | "published"
  | "retired"
  | "archived";

export type ResearchArtifact = {
  schema_version: "1.0.0";
  artifact_id: string;
  artifact_hash: string;
  created_at: string;
  publication_state: PublicationState;
  instrument: {
    ticker: string;
    name: string;
    exchange: string;
    asset_class: "ETF" | "ETN" | "Index" | "Equity" | "Other";
    category: string;
    data_rights_status:
      | "prototype_only"
      | "internal_research"
      | "display_approved"
      | "redistribution_approved";
  };
  strategy_family: {
    family_id: string;
    name: string;
    methodology_summary: string;
  };
  strategy_variant: {
    variant_id: string;
    slug: string;
    status: "research" | "paper_live" | "live_track_record" | "retired";
    risk_band: "Low" | "Moderate" | "Elevated" | "High";
    approved_benchmarks: string[];
  };
  strategy_rule_version: {
    rule_version_id: string;
    implementation_hash: string;
    rule_text: string;
    parameters: Record<string, string | number | boolean | null>;
  };
  methodology_version: {
    methodology_version_id: string;
    summary: string;
    known_limitations: string[];
  };
  data_snapshot: {
    snapshot_id: string;
    vendor: string;
    as_of_date: string;
    price_adjustment: "raw" | "split_adjusted" | "split_and_dividend_adjusted";
    license_scope:
      | "prototype_only"
      | "internal_research"
      | "display_approved"
      | "redistribution_approved";
  };
  assumptions: {
    assumptions_version_id: string;
    initial_capital: number;
    commission_bps: number;
    slippage_bps: number;
    taxes_included: boolean;
    execution_timing: string;
  };
  backtest_run: {
    run_id: string;
    engine_version: string;
    sample_start: string;
    sample_end: string;
    benchmark_ticker: string;
    created_by: string;
  };
  metric_snapshot: {
    cagr: number;
    total_return: number;
    annualized_volatility: number;
    max_drawdown: number;
    benchmark_return: number;
    excess_return: number;
    sharpe: number | null;
    sortino: number | null;
    turnover: number;
    trade_count: number;
    win_rate: number;
    worst_month: number;
    worst_year: number;
  };
  performance_series: Record<
    "normalized_equity" | "benchmark_equity" | "drawdown" | "monthly_returns" | "yearly_returns",
    Array<{ date: string; value: number }>
  >;
  research_report: {
    title: string;
    summary: string;
    limitations: string[];
    methodology_url: string;
  };
  disclosure: {
    disclosure_version_id: string;
    performance_type: "hypothetical_backtest" | "paper_live" | "live_track_record";
    no_advice_text: string;
    no_guarantee_text: string;
    conflict_disclosure: string;
  };
  content_review: {
    stage: PublicationState;
    quant_reviewer: string | null;
    compliance_reviewer: string | null;
    approved_at: string | null;
    review_notes: string;
  };
};
