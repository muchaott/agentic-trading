const variants = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    category: "Broad market",
    risk: "Moderate",
    status: "research",
    reviewStage: "published",
    updated: "2026-07-10",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Baseline mean-reversion research on a broad U.S. equity ETF. The report emphasizes drawdown, benchmark comparison, and fixed assumptions over headline returns.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 7.9, total: 46.2, maxDrawdown: -13.8, volatility: 14.9, trades: 38, winRate: 57, worstMonth: -6.1, worstYear: -9.7, turnover: 1.8 },
        gross: { cagr: 8.4, total: 49.7, maxDrawdown: -13.5, volatility: 14.7, trades: 38, winRate: 58, worstMonth: -5.8, worstYear: -9.2, turnover: 1.8 }
      },
      "10Y": {
        estimatedNet: { cagr: 8.6, total: 128.1, maxDrawdown: -18.4, volatility: 15.7, trades: 76, winRate: 56, worstMonth: -7.6, worstYear: -12.4, turnover: 1.9 },
        gross: { cagr: 9.1, total: 138.7, maxDrawdown: -18.1, volatility: 15.4, trades: 76, winRate: 57, worstMonth: -7.2, worstYear: -11.9, turnover: 1.9 }
      }
    },
    events: [
      { date: "2026-06-18", type: "Bearish", note: "Upper band touch with RSI above 70", confidence: "Research only" },
      { date: "2026-04-07", type: "Bullish", note: "Lower band touch after volatility spike", confidence: "Research only" },
      { date: "2025-12-12", type: "Bearish", note: "Overbought daily close", confidence: "Research only" }
    ]
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    category: "Technology",
    risk: "High",
    status: "paper-live",
    reviewStage: "compliance",
    updated: "2026-07-09",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Technology-heavy ETF variant with higher upside and sharper drawdowns. Paper-live status means live-like tracking exists but is not a public signal product.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 9.4, total: 56.8, maxDrawdown: -22.2, volatility: 21.6, trades: 44, winRate: 54, worstMonth: -9.8, worstYear: -15.3, turnover: 2.2 },
        gross: { cagr: 10.0, total: 61.0, maxDrawdown: -21.9, volatility: 21.3, trades: 44, winRate: 55, worstMonth: -9.4, worstYear: -14.8, turnover: 2.2 }
      },
      "10Y": {
        estimatedNet: { cagr: 10.2, total: 164.0, maxDrawdown: -28.6, volatility: 22.8, trades: 88, winRate: 53, worstMonth: -11.2, worstYear: -18.6, turnover: 2.3 },
        gross: { cagr: 10.8, total: 178.9, maxDrawdown: -28.1, volatility: 22.4, trades: 88, winRate: 54, worstMonth: -10.8, worstYear: -17.9, turnover: 2.3 }
      }
    },
    events: [
      { date: "2026-07-02", type: "Bearish", note: "RSI extension after two-week rally", confidence: "Delayed research" },
      { date: "2026-05-01", type: "Bullish", note: "Lower band touch with mean-reversion setup", confidence: "Research only" },
      { date: "2025-11-25", type: "Bearish", note: "Overbought daily close", confidence: "Research only" }
    ]
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    category: "Broad market",
    risk: "Moderate",
    status: "research",
    reviewStage: "published",
    updated: "2026-07-08",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Total U.S. market ETF variant. Similar broad-market exposure to SPY, with slightly different breadth and turnover behavior in the demo research run.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 7.5, total: 43.8, maxDrawdown: -14.7, volatility: 15.4, trades: 36, winRate: 56, worstMonth: -6.4, worstYear: -10.6, turnover: 1.7 },
        gross: { cagr: 8.1, total: 47.5, maxDrawdown: -14.3, volatility: 15.1, trades: 36, winRate: 57, worstMonth: -6.1, worstYear: -10.1, turnover: 1.7 }
      },
      "10Y": {
        estimatedNet: { cagr: 8.2, total: 120.6, maxDrawdown: -19.2, volatility: 16.1, trades: 74, winRate: 55, worstMonth: -7.8, worstYear: -13.1, turnover: 1.8 },
        gross: { cagr: 8.8, total: 131.5, maxDrawdown: -18.9, volatility: 15.8, trades: 74, winRate: 56, worstMonth: -7.4, worstYear: -12.5, turnover: 1.8 }
      }
    },
    events: [
      { date: "2026-06-17", type: "Bearish", note: "Upper band touch with elevated RSI", confidence: "Research only" },
      { date: "2026-04-08", type: "Bullish", note: "Lower band touch", confidence: "Research only" },
      { date: "2025-10-02", type: "Bullish", note: "Oversold daily close", confidence: "Research only" }
    ]
  },
  {
    ticker: "IWM",
    name: "iShares Russell 2000 ETF",
    category: "Small cap",
    risk: "Elevated",
    status: "research",
    reviewStage: "quant",
    updated: "2026-07-07",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Small-cap ETF variant with higher noise, more frequent triggers, and a stricter review requirement before publication.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 5.1, total: 28.2, maxDrawdown: -21.9, volatility: 22.1, trades: 49, winRate: 51, worstMonth: -10.2, worstYear: -18.7, turnover: 2.7 },
        gross: { cagr: 5.9, total: 33.2, maxDrawdown: -21.5, volatility: 21.8, trades: 49, winRate: 52, worstMonth: -9.8, worstYear: -18.0, turnover: 2.7 }
      },
      "10Y": {
        estimatedNet: { cagr: 5.8, total: 75.8, maxDrawdown: -31.5, volatility: 23.3, trades: 96, winRate: 52, worstMonth: -12.6, worstYear: -22.4, turnover: 2.8 },
        gross: { cagr: 6.6, total: 89.3, maxDrawdown: -31.0, volatility: 23.0, trades: 96, winRate: 53, worstMonth: -12.1, worstYear: -21.7, turnover: 2.8 }
      }
    },
    events: [
      { date: "2026-06-24", type: "Bullish", note: "Oversold small-cap basket", confidence: "Research only" },
      { date: "2026-02-12", type: "Bearish", note: "Upper band touch after gap-up", confidence: "Research only" },
      { date: "2025-09-19", type: "Bullish", note: "Lower band touch", confidence: "Research only" }
    ]
  },
  {
    ticker: "XLK",
    name: "Technology Select Sector SPDR Fund",
    category: "Technology",
    risk: "High",
    status: "research",
    reviewStage: "draft",
    updated: "2026-07-06",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Sector technology ETF variant. The prototype flags this as draft to show that not every high-return research run should be publishable.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 10.1, total: 61.8, maxDrawdown: -24.8, volatility: 23.4, trades: 45, winRate: 52, worstMonth: -10.9, worstYear: -17.5, turnover: 2.3 },
        gross: { cagr: 10.7, total: 66.5, maxDrawdown: -24.3, volatility: 23.1, trades: 45, winRate: 53, worstMonth: -10.5, worstYear: -16.8, turnover: 2.3 }
      },
      "10Y": {
        estimatedNet: { cagr: 11.0, total: 184.1, maxDrawdown: -30.4, volatility: 24.2, trades: 92, winRate: 52, worstMonth: -12.0, worstYear: -20.8, turnover: 2.4 },
        gross: { cagr: 11.7, total: 202.3, maxDrawdown: -29.8, volatility: 23.8, trades: 92, winRate: 53, worstMonth: -11.5, worstYear: -19.9, turnover: 2.4 }
      }
    },
    events: [
      { date: "2026-07-01", type: "Bearish", note: "Upper band touch with sector concentration risk", confidence: "Draft" },
      { date: "2026-04-29", type: "Bullish", note: "Lower band touch", confidence: "Draft" },
      { date: "2025-12-03", type: "Bearish", note: "RSI above threshold", confidence: "Draft" }
    ]
  },
  {
    ticker: "XLF",
    name: "Financial Select Sector SPDR Fund",
    category: "Sector",
    risk: "Elevated",
    status: "research",
    reviewStage: "compliance",
    updated: "2026-07-05",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Financial-sector ETF variant. Review focus is on sector cyclicality and whether benchmark comparisons are clear enough.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 6.2, total: 35.1, maxDrawdown: -18.9, volatility: 19.0, trades: 42, winRate: 54, worstMonth: -8.7, worstYear: -14.1, turnover: 2.1 },
        gross: { cagr: 6.8, total: 38.8, maxDrawdown: -18.6, volatility: 18.7, trades: 42, winRate: 55, worstMonth: -8.3, worstYear: -13.6, turnover: 2.1 }
      },
      "10Y": {
        estimatedNet: { cagr: 6.9, total: 95.4, maxDrawdown: -27.2, volatility: 20.4, trades: 82, winRate: 53, worstMonth: -11.5, worstYear: -19.8, turnover: 2.2 },
        gross: { cagr: 7.5, total: 106.1, maxDrawdown: -26.7, volatility: 20.1, trades: 82, winRate: 54, worstMonth: -11.0, worstYear: -19.0, turnover: 2.2 }
      }
    },
    events: [
      { date: "2026-06-05", type: "Bullish", note: "Lower band touch after rate sensitivity selloff", confidence: "Research only" },
      { date: "2026-01-21", type: "Bearish", note: "Upper band touch", confidence: "Research only" },
      { date: "2025-08-28", type: "Bullish", note: "Oversold daily close", confidence: "Research only" }
    ]
  },
  {
    ticker: "EFA",
    name: "iShares MSCI EAFE ETF",
    category: "International",
    risk: "Elevated",
    status: "research",
    reviewStage: "quant",
    updated: "2026-07-04",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Developed international equity ETF variant. Currency exposure and market-hour mismatch are explicit review notes before publication.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 4.9, total: 27.0, maxDrawdown: -17.4, volatility: 17.8, trades: 40, winRate: 53, worstMonth: -7.4, worstYear: -12.6, turnover: 2.0 },
        gross: { cagr: 5.5, total: 30.7, maxDrawdown: -17.1, volatility: 17.5, trades: 40, winRate: 54, worstMonth: -7.0, worstYear: -12.1, turnover: 2.0 }
      },
      "10Y": {
        estimatedNet: { cagr: 5.4, total: 69.4, maxDrawdown: -24.8, volatility: 18.6, trades: 80, winRate: 52, worstMonth: -9.6, worstYear: -16.9, turnover: 2.1 },
        gross: { cagr: 6.0, total: 79.1, maxDrawdown: -24.2, volatility: 18.3, trades: 80, winRate: 53, worstMonth: -9.2, worstYear: -16.2, turnover: 2.1 }
      }
    },
    events: [
      { date: "2026-05-27", type: "Bearish", note: "Upper band touch", confidence: "Research only" },
      { date: "2026-03-13", type: "Bullish", note: "Lower band touch", confidence: "Research only" },
      { date: "2025-07-30", type: "Bearish", note: "Overbought daily close", confidence: "Research only" }
    ]
  },
  {
    ticker: "XLE",
    name: "Energy Select Sector SPDR Fund",
    category: "Sector",
    risk: "High",
    status: "retired",
    reviewStage: "archived",
    updated: "2026-06-30",
    sample: "2016-07-01 to 2026-06-30",
    ruleVersion: "MR-BBRSI-001",
    methodologyVersion: "METH-2026.07",
    summary:
      "Energy-sector ETF variant shown as retired because commodity sensitivity made the mean-reversion rule too unstable in this sample workflow.",
    metrics: {
      "5Y": {
        estimatedNet: { cagr: 3.7, total: 20.0, maxDrawdown: -32.1, volatility: 28.4, trades: 53, winRate: 48, worstMonth: -15.1, worstYear: -26.0, turnover: 3.1 },
        gross: { cagr: 4.5, total: 24.6, maxDrawdown: -31.4, volatility: 28.0, trades: 53, winRate: 49, worstMonth: -14.6, worstYear: -25.1, turnover: 3.1 }
      },
      "10Y": {
        estimatedNet: { cagr: 4.1, total: 49.5, maxDrawdown: -42.4, volatility: 30.0, trades: 108, winRate: 47, worstMonth: -18.8, worstYear: -31.7, turnover: 3.3 },
        gross: { cagr: 4.9, total: 61.3, maxDrawdown: -41.9, volatility: 29.5, trades: 108, winRate: 48, worstMonth: -18.2, worstYear: -30.9, turnover: 3.3 }
      }
    },
    events: [
      { date: "2026-06-12", type: "Bearish", note: "Retired research run remains visible for auditability", confidence: "Archived" },
      { date: "2026-03-04", type: "Bullish", note: "Oversold daily close", confidence: "Archived" },
      { date: "2025-10-16", type: "Bearish", note: "Upper band touch", confidence: "Archived" }
    ]
  }
];

const benchmarkReturns = {
  SPY: { "5Y": 44.9, "10Y": 106.0 },
  QQQ: { "5Y": 67.5, "10Y": 171.4 },
  IWM: { "5Y": 24.1, "10Y": 62.8 }
};

const waitlistStorageKey = "strategyLedgerWaitlist";

const reviewLabels = {
  draft: "Draft",
  quant: "Quant reviewed",
  compliance: "Compliance reviewed",
  published: "Published",
  archived: "Archived"
};

const reviewOrder = ["draft", "quant", "compliance", "published", "archived"];

const fallbackMetrics = {
  cagr: 0,
  total: 0,
  maxDrawdown: 0,
  volatility: 0,
  trades: 0,
  winRate: 0,
  worstMonth: 0,
  worstYear: 0,
  turnover: 0
};

const state = {
  selectedTicker: "SPY",
  category: "all",
  risk: "all",
  status: "all",
  timeframe: "10Y",
  cost: "estimatedNet",
  benchmark: "SPY",
  queueFilter: "all"
};

const elements = {};
let memoryWaitlistEntries = [];
let waitlistOpener = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  setView(viewFromHash(), false);
  renderAll();
});

function cacheElements() {
  elements.catalogList = document.getElementById("catalogList");
  elements.catalogCount = document.getElementById("catalogCount");
  elements.categoryFilter = document.getElementById("categoryFilter");
  elements.riskFilter = document.getElementById("riskFilter");
  elements.statusFilter = document.getElementById("statusFilter");
  elements.timeframeControl = document.getElementById("timeframeControl");
  elements.costControl = document.getElementById("costControl");
  elements.benchmarkControl = document.getElementById("benchmarkControl");
  elements.reportFamily = document.getElementById("reportFamily");
  elements.reportTitle = document.getElementById("reportTitle");
  elements.reportSummary = document.getElementById("reportSummary");
  elements.reportStatus = document.getElementById("reportStatus");
  elements.reportAsOf = document.getElementById("reportAsOf");
  elements.metricGrid = document.getElementById("metricGrid");
  elements.rulesList = document.getElementById("rulesList");
  elements.eventsList = document.getElementById("eventsList");
  elements.trustChecks = document.getElementById("trustChecks");
  elements.reviewStepper = document.getElementById("reviewStepper");
  elements.equityChart = document.getElementById("equityChart");
  elements.drawdownChart = document.getElementById("drawdownChart");
  elements.reviewTable = document.getElementById("reviewTable");
  elements.waitlistModal = document.getElementById("waitlistModal");
  elements.waitlistForm = document.getElementById("waitlistForm");
  elements.formMessage = document.getElementById("formMessage");
  elements.closeWaitlistButton = document.querySelector(".close-button");
  elements.emailInput = document.getElementById("emailInput");
  elements.interestInput = document.getElementById("interestInput");
  elements.priceInput = document.getElementById("priceInput");
  elements.viewButtons = document.querySelectorAll("[data-view-button]");
  elements.waitlistButtons = document.querySelectorAll("[data-open-waitlist]");
  elements.queueFilterButtons = document.querySelectorAll("[data-queue-filter]");
}

function bindEvents() {
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewButton));
  });
  syncViewButtons("research");

  on(elements.categoryFilter, "change", (event) => updateCatalogFilter("category", event.target.value));

  on(elements.riskFilter, "change", (event) => updateCatalogFilter("risk", event.target.value));

  on(elements.statusFilter, "change", (event) => updateCatalogFilter("status", event.target.value));

  on(elements.timeframeControl, "change", (event) => {
    state.timeframe = event.target.value;
    renderReport(currentReportVariant());
  });

  on(elements.costControl, "change", (event) => {
    state.cost = event.target.value;
    renderReport(currentReportVariant());
  });

  on(elements.benchmarkControl, "change", (event) => {
    state.benchmark = event.target.value;
    renderReport(currentReportVariant());
  });

  on(elements.catalogList, "click", (event) => {
    const card = event.target.closest("[data-ticker]");
    if (!card) return;
    state.selectedTicker = card.dataset.ticker;
    renderCatalog();
    renderReport(selectedVariant());
  });

  elements.waitlistButtons.forEach((button) => {
    button.addEventListener("click", (event) => openWaitlist(event.currentTarget));
  });

  on(elements.closeWaitlistButton, "click", closeWaitlist);
  on(elements.waitlistModal, "click", (event) => {
    if (event.target === elements.waitlistModal) closeWaitlist();
  });
  on(document, "keydown", (event) => {
    if (event.key === "Escape" && elements.waitlistModal && elements.waitlistModal.open) {
      closeWaitlist();
    }
  });

  on(elements.waitlistForm, "submit", handleWaitlistSubmit);

  elements.queueFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.queueFilter = button.dataset.queueFilter;
      renderReviewQueue();
    });
  });

  on(elements.reviewTable, "click", (event) => {
    const action = event.target.closest("[data-review-action]");
    if (!action) return;
    const variant = variants.find((item) => item.ticker === action.dataset.ticker);
    if (!variant) return;
    if (advanceReview(variant, action.dataset.reviewAction)) {
      renderAll();
    }
  });

  window.addEventListener("hashchange", () => setView(viewFromHash(), false));

  window.addEventListener("resize", debounce(() => {
    renderCharts(currentReportVariant());
  }, 150));
}

function on(target, eventName, handler) {
  if (target && typeof target.addEventListener === "function") {
    target.addEventListener(eventName, handler);
  }
}

function setView(viewName, updateHash = true) {
  const availableViews = Array.from(document.querySelectorAll("[data-view]")).map((view) => view.dataset.view);
  const safeViewName = availableViews.includes(viewName) ? viewName : "research";
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === safeViewName);
  });
  syncViewButtons(safeViewName);
  if (updateHash) {
    const nextHash = safeViewName === "research" ? "#research" : `#${safeViewName}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }
  if (safeViewName === "research") {
    window.requestAnimationFrame(() => renderCharts(currentReportVariant()));
  }
}

function viewFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const aliases = {
    "": "research",
    research: "research",
    methodology: "methodology",
    "data-sources": "data-risk",
    "risk-disclosures": "data-risk",
    "data-risk": "data-risk",
    waitlist: "research",
    review: "review"
  };
  if (hash === "waitlist") {
    window.requestAnimationFrame(() => openWaitlist());
  }
  return aliases[hash] || "research";
}

function syncViewButtons(viewName) {
  document.querySelectorAll("[data-view-button]").forEach((button) => {
    const isActive = button.dataset.viewButton === viewName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateCatalogFilter(key, value) {
  state[key] = value;
  renderResearch();
}

function renderAll() {
  renderResearch();
  renderReviewQueue();
}

function renderResearch() {
  const filtered = filteredVariants();
  syncSelectedTicker(filtered);
  renderCatalog(filtered);
  renderReport(filtered.length ? selectedVariant() : null);
}

function filteredVariants() {
  return variants
    .filter((variant) => state.category === "all" || variant.category === state.category)
    .filter((variant) => state.risk === "all" || variant.risk === state.risk)
    .filter((variant) => state.status === "all" || variant.status === state.status)
    .sort((a, b) => timestampFor(b.updated) - timestampFor(a.updated));
}

function syncSelectedTicker(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return;
  const selectedIsVisible = candidates.some((variant) => variant.ticker === state.selectedTicker);
  if (!selectedIsVisible) {
    state.selectedTicker = candidates[0].ticker;
  }
}

function currentReportVariant() {
  const filtered = filteredVariants();
  syncSelectedTicker(filtered);
  return filtered.length ? selectedVariant() : null;
}

function renderCatalog(filtered = filteredVariants()) {
  if (!elements.catalogList || !elements.catalogCount) return;
  syncSelectedTicker(filtered);

  elements.catalogCount.textContent = String(filtered.length);

  if (!filtered.length) {
    elements.catalogList.innerHTML = `<p class="instrument-name">No research variants match these filters.</p>`;
    return;
  }

  elements.catalogList.innerHTML = filtered
    .map((variant) => {
      const metrics = metricFor(variant);
      const benchmarkTotal = benchmarkReturn();
      const excess = metrics.total - benchmarkTotal;
      const selected = variant.ticker === state.selectedTicker ? " is-selected" : "";
      return `
        <button class="strategy-card${selected}" type="button" data-ticker="${escapeAttr(variant.ticker)}" aria-pressed="${variant.ticker === state.selectedTicker}">
          <div class="card-topline">
            <span class="ticker">${escapeHtml(variant.ticker)}</span>
            <span class="risk-pill">${escapeHtml(variant.risk)}</span>
          </div>
          <p class="instrument-name">${escapeHtml(variant.name)}</p>
          <div class="card-badges" aria-label="Research metadata">
            <span>${escapeHtml(statusLabel(variant.status))}</span>
            <span>Hypothetical</span>
            <span>${escapeHtml(state.cost === "estimatedNet" ? "Estimated net" : "Gross")}</span>
          </div>
          <div class="card-metrics">
            <span class="mini-metric">
              <span>CAGR</span>
              <span>${formatPct(metrics.cagr)}</span>
            </span>
            <span class="mini-metric">
              <span>Max DD</span>
              <span>${formatPct(metrics.maxDrawdown)}</span>
            </span>
            <span class="mini-metric">
              <span>Vol</span>
              <span>${formatPct(metrics.volatility)}</span>
            </span>
            <span class="mini-metric">
              <span>Excess vs ${escapeHtml(state.benchmark)}</span>
              <span>${formatSignedPct(excess)}</span>
            </span>
            <span class="mini-metric">
              <span>Trades</span>
              <span>${escapeHtml(metrics.trades)}</span>
            </span>
            <span class="mini-metric">
              <span>Data as of</span>
              <span>${formatShortDate(variant.updated)}</span>
            </span>
          </div>
          <p class="card-footnote">Sample: ${escapeHtml(variant.sample)}. Fee/slippage assumptions versioned.</p>
        </button>
      `;
    })
    .join("");
}

function renderReport(variant = selectedVariant()) {
  if (!elements.reportTitle || !elements.metricGrid) return;
  if (!variant) {
    renderEmptyReport();
    return;
  }
  normalizeReportState(variant);
  const metrics = metricFor(variant);
  const benchmarkTotal = benchmarkReturn();
  const excess = metrics.total - benchmarkTotal;

  elements.reportFamily.textContent = "Baseline ETF mean reversion";
  elements.reportTitle.textContent = `${variant.ticker} research report`;
  elements.reportSummary.textContent = variant.summary;
  elements.reportAsOf.textContent = `Data as of ${formatDate(variant.updated)}`;
  elements.reportStatus.textContent = statusLabel(variant.status);
  elements.reportStatus.className = `status-badge ${classToken(variant.status)}`;

  elements.metricGrid.innerHTML = [
    metricTile("Max drawdown", formatPct(metrics.maxDrawdown), "risk"),
    metricTile("CAGR", formatPct(metrics.cagr), ""),
    metricTile("Total return", formatPct(metrics.total), ""),
    metricTile("Volatility", formatPct(metrics.volatility), ""),
    metricTile(`${state.benchmark} return`, formatPct(benchmarkTotal), ""),
    metricTile("Excess", formatSignedPct(excess), excess < 0 ? "risk" : ""),
    metricTile("Trades", String(metrics.trades), ""),
    metricTile("Win rate", formatPct(metrics.winRate), ""),
    metricTile("Turnover", `${metrics.turnover.toFixed(1)}x`, ""),
    metricTile("Worst month", formatPct(metrics.worstMonth), "risk"),
    metricTile("Worst year", formatPct(metrics.worstYear), "risk"),
    metricTile("Status", statusLabel(variant.status), "")
  ].join("");

  elements.rulesList.innerHTML = [
    `Rule version ${variant.ruleVersion}; methodology ${variant.methodologyVersion}.`,
    "Lower-band trigger: daily adjusted close is at or below the lower 20-day Bollinger Band and 14-day RSI is below 30.",
    "Upper-band trigger: daily adjusted close is at or above the upper 20-day Bollinger Band and 14-day RSI is above 70.",
    "Hypothetical entry: next-session open after a lower-band trigger; upper-band triggers move the model to cash rather than shorting.",
    "Hypothetical exit: return to 20-day moving average or 10 trading days, whichever comes first.",
    "Position sizing: 100% notional single ETF exposure while active; cash otherwise; taxes excluded.",
    "Cost assumption: estimated net mode applies 5 bps slippage per trade and zero explicit commission.",
    "Data treatment: adjusted daily prices, fixed sample period, no arbitrary parameter optimization.",
    `Display mode: ${state.cost === "estimatedNet" ? "estimated net with fee/slippage assumptions" : "gross before cost assumptions"}.`
  ]
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const events = Array.isArray(variant.events) ? variant.events : [];
  elements.eventsList.innerHTML = events.length
    ? events
        .map((event) => {
          const eventClass = classToken(String(event.type || "").toLowerCase());
          const eventLabel = triggerLabel(event.type);
          return `
            <div class="event-row">
              <span class="event-date">${formatDate(event.date)}</span>
              <span>
                <strong class="event-type ${eventClass}">${escapeHtml(eventLabel)}</strong>
                <span class="instrument-name">${escapeHtml(event.note)}</span>
              </span>
              <span class="metric-pill">${escapeHtml(event.confidence)}</span>
            </div>
          `;
        })
        .join("")
    : `<p class="instrument-name">No recent research events are available.</p>`;

  renderTrust(variant);
  renderChartSummary(variant, metrics, benchmarkTotal, excess);
  renderCharts(variant);
}

function renderEmptyReport() {
  elements.reportFamily.textContent = "Baseline ETF mean reversion";
  elements.reportTitle.textContent = "No matching research report";
  elements.reportSummary.textContent = "Adjust the catalog filters to select a reviewed ETF research artifact.";
  elements.reportAsOf.textContent = "Data as of --";
  elements.reportStatus.textContent = "Research";
  elements.reportStatus.className = "status-badge";
  elements.metricGrid.innerHTML = "";
  elements.rulesList.innerHTML = "<li>No filtered research artifact is selected.</li>";
  elements.eventsList.innerHTML = `<p class="instrument-name">No research events to display.</p>`;
  elements.trustChecks.innerHTML = `
    <div class="trust-item">
      <span class="trust-dot">R</span>
      <span>Research-only; no personalized advice or trade instruction.</span>
    </div>
  `;
  elements.reviewStepper.innerHTML = "";
  renderChartSummary(null);
  clearChart(elements.equityChart, 320, "No matching chart data");
  clearChart(elements.drawdownChart, 180, "No matching drawdown data");
}

function renderChartSummary(variant, metrics = fallbackMetrics, benchmarkTotal = 0, excess = 0) {
  const summary = document.getElementById("chartSummary");
  if (!summary) return;
  if (!variant) {
    summary.innerHTML = `<p class="instrument-name">No accessible chart summary is available for the current filters.</p>`;
    return;
  }
  summary.innerHTML = `
    <div class="report-mini-table">
      <span>ETF</span>
      <strong>${escapeHtml(variant.ticker)}</strong>
      <span>Sample</span>
      <strong>${escapeHtml(variant.sample)}</strong>
      <span>Strategy total return</span>
      <strong>${formatPct(metrics.total)}</strong>
      <span>${escapeHtml(state.benchmark)} benchmark return</span>
      <strong>${formatPct(benchmarkTotal)}</strong>
      <span>Excess return</span>
      <strong>${formatSignedPct(excess)}</strong>
      <span>Worst drawdown</span>
      <strong>${formatPct(metrics.maxDrawdown)}</strong>
    </div>
  `;
}

function renderTrust(variant) {
  const checks = [
    ["H", "Hypothetical/backtested label visible"],
    ["V", `Strategy rule version: ${variant.ruleVersion}`],
    ["D", "Drawdown shown next to return"],
    ["N", state.cost === "estimatedNet" ? "Estimated net costs displayed" : "Gross display clearly labeled"],
    ["R", "Research-only; no personalized advice or trade instruction"],
    ["C", "Conflict and data-rights review required before paid launch"]
  ];

  elements.trustChecks.innerHTML = checks
    .map(([letter, text]) => `
      <div class="trust-item">
        <span class="trust-dot">${escapeHtml(letter)}</span>
        <span>${escapeHtml(text)}</span>
      </div>
    `)
    .join("");

  const stage = safeReviewStage(variant.reviewStage);
  const currentIndex = reviewOrder.indexOf(stage);
  elements.reviewStepper.innerHTML = reviewOrder
    .filter((candidate) => candidate !== "archived" || stage === "archived")
    .map((candidate, index) => {
      const done = index < currentIndex || candidate === stage;
      const current = candidate === stage;
      return `
        <div class="review-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}">
          <span>${done ? "OK" : index + 1}</span>
          <strong>${escapeHtml(reviewLabels[candidate] || candidate)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderCharts(variant) {
  if (!variant) {
    clearChart(elements.equityChart, 320, "No matching chart data");
    clearChart(elements.drawdownChart, 180, "No matching drawdown data");
    return;
  }
  const metrics = metricFor(variant);
  const strategySeries = buildSeries(`${variant.ticker}-${state.timeframe}-${state.cost}`, metrics.total, metrics.maxDrawdown);
  const benchmarkSeries = buildSeries(`${state.benchmark}-${state.timeframe}-benchmark`, benchmarkReturn(), -18);
  drawLineChart(elements.equityChart, strategySeries, benchmarkSeries);
  drawDrawdownChart(elements.drawdownChart, drawdownFrom(strategySeries));
}

function drawLineChart(canvas, strategySeries, benchmarkSeries) {
  const chart = prepareCanvas(canvas, 320);
  if (!chart) return;
  const { ctx, width, height } = chart;
  const pad = { top: 22, right: 18, bottom: 28, left: 48 };
  const safeStrategy = cleanSeries(strategySeries);
  const safeBenchmark = cleanSeries(benchmarkSeries);
  const values = [...safeStrategy, ...safeBenchmark];
  if (!values.length) {
    drawEmptyChart(ctx, width, height, "No chart data");
    return;
  }
  const bounds = chartBounds(values, 0.04);

  drawGrid(ctx, width, height, pad);
  drawSeries(ctx, safeStrategy, bounds.min, bounds.max, width, height, pad, "#0f766e", 3);
  drawSeries(ctx, safeBenchmark, bounds.min, bounds.max, width, height, pad, "#235789", 2);
  drawAxisLabels(ctx, width, height, pad, bounds.min, bounds.max, "$");
}

function drawDrawdownChart(canvas, drawdowns) {
  const chart = prepareCanvas(canvas, 180);
  if (!chart) return;
  const { ctx, width, height } = chart;
  const pad = { top: 18, right: 18, bottom: 24, left: 48 };
  const safeDrawdowns = cleanSeries(drawdowns);
  if (!safeDrawdowns.length) {
    drawEmptyChart(ctx, width, height, "No drawdown data");
    return;
  }
  const min = Math.min(-5, ...safeDrawdowns);
  const max = 0;

  drawGrid(ctx, width, height, pad);
  drawSeries(ctx, safeDrawdowns, min, max, width, height, pad, "#b73535", 2, true);
  drawAxisLabels(ctx, width, height, pad, min, max, "", "%");
}

function prepareCanvas(canvas, cssHeight) {
  if (!canvas || typeof canvas.getContext !== "function") return null;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(320, Math.floor(canvas.clientWidth || canvas.width || 320));
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, cssHeight);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, cssHeight);
  return { ctx, width, height: cssHeight };
}

function clearChart(canvas, cssHeight, message) {
  const chart = prepareCanvas(canvas, cssHeight);
  if (!chart) return;
  drawEmptyChart(chart.ctx, chart.width, chart.height, message);
}

function drawEmptyChart(ctx, width, height, message) {
  ctx.fillStyle = "#7b8983";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, width / 2, height / 2);
}

function drawGrid(ctx, width, height, pad) {
  ctx.strokeStyle = "#edf2ef";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }
}

function drawSeries(ctx, series, min, max, width, height, pad, color, lineWidth, fillArea = false) {
  if (!Array.isArray(series) || series.length < 2) return;
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const range = max - min || 1;
  const points = series.map((value, index) => {
    const x = pad.left + (plotWidth * index) / (series.length - 1);
    const y = pad.top + plotHeight - ((value - min) / range) * plotHeight;
    return [x, y];
  });

  if (fillArea) {
    const baselineY = clamp(pad.top + plotHeight - ((0 - min) / range) * plotHeight, pad.top, height - pad.bottom);
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(points[points.length - 1][0], baselineY);
    ctx.lineTo(points[0][0], baselineY);
    ctx.closePath();
    ctx.fillStyle = "rgba(183, 53, 53, 0.10)";
    ctx.fill();
  }

  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawAxisLabels(ctx, width, height, pad, min, max, prefix = "", suffix = "") {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin + 1;
  ctx.fillStyle = "#7b8983";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  [safeMax, (safeMax + safeMin) / 2, safeMin].forEach((value, index) => {
    const y = index === 0 ? pad.top : index === 1 ? height / 2 : height - pad.bottom;
    const label = suffix ? `${Math.round(value)}${suffix}` : `${prefix}${Math.round(value).toLocaleString()}`;
    ctx.fillText(label, pad.left - 8, y);
  });

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Start", pad.left, height - 7);
  ctx.textAlign = "right";
  ctx.fillText(state.timeframe, width - pad.right, height - 7);
}

function buildSeries(key, totalReturn, maxDrawdown) {
  const count = state.timeframe === "10Y" ? 48 : 32;
  const seed = numericSeed(key);
  const safeTotalReturn = Number.isFinite(totalReturn) ? totalReturn : 0;
  const safeMaxDrawdown = Number.isFinite(maxDrawdown) ? maxDrawdown : -5;
  const endValue = Math.max(100, 10000 * (1 + safeTotalReturn / 100));
  const series = [];

  for (let index = 0; index < count; index += 1) {
    const progress = index / (count - 1);
    const trend = 10000 * Math.pow(endValue / 10000, progress);
    const wave =
      Math.sin(progress * Math.PI * 4 + seed) * 0.035 +
      Math.sin(progress * Math.PI * 9 + seed / 2) * 0.018;
    const shockCenter = 0.58 + ((seed % 9) - 4) / 100;
    const shock = -Math.abs(safeMaxDrawdown / 100) * 0.35 * Math.exp(-Math.pow((progress - shockCenter) / 0.12, 2));
    const value = trend * (1 + wave + shock);
    series.push(Math.max(1200, value));
  }

  series[0] = 10000;
  series[series.length - 1] = endValue;
  return series;
}

function drawdownFrom(series) {
  const safeSeries = cleanSeries(series);
  if (!safeSeries.length) return [];
  let peak = Math.max(1, safeSeries[0]);
  return safeSeries.map((value) => {
    peak = Math.max(peak, value);
    return ((value - peak) / peak) * 100;
  });
}

function cleanSeries(series) {
  if (!Array.isArray(series)) return [];
  return series.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function chartBounds(values, paddingRatio) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) {
    const offset = Math.max(1, Math.abs(min) * paddingRatio);
    return { min: min - offset, max: max + offset };
  }
  const padding = (max - min) * paddingRatio;
  return { min: min - padding, max: max + padding };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderReviewQueue() {
  if (!elements.reviewTable) return;
  if (state.queueFilter !== "all" && !reviewOrder.includes(state.queueFilter)) {
    state.queueFilter = "all";
  }
  syncQueueFilterButtons();
  const rows = variants
    .filter((variant) => state.queueFilter === "all" || variant.reviewStage === state.queueFilter)
    .sort((a, b) => timestampFor(b.updated) - timestampFor(a.updated));

  if (!rows.length) {
    elements.reviewTable.innerHTML = `<p class="instrument-name">No artifacts in this review state.</p>`;
    return;
  }

  elements.reviewTable.innerHTML = rows
    .map((variant) => {
      const stage = safeReviewStage(variant.reviewStage);
      const canAdvance = stage !== "published" && stage !== "archived";
      const canArchive = stage !== "archived";
      return `
        <article class="queue-row">
          <div>
            <div class="queue-row-top">
              <h3>${escapeHtml(variant.ticker)} ${escapeHtml(variant.name)}</h3>
              <span class="status-badge ${classToken(variant.status)}">${escapeHtml(reviewLabels[stage] || stage)}</span>
            </div>
            <p>
              ${escapeHtml(variant.ruleVersion)} - ${escapeHtml(variant.methodologyVersion)} - Updated ${formatDate(variant.updated)}
            </p>
          </div>
          <div class="queue-actions">
            ${canAdvance ? `<button class="secondary-action" type="button" data-review-action="advance" data-ticker="${escapeAttr(variant.ticker)}">Advance</button>` : ""}
            ${canArchive ? `<button class="secondary-action" type="button" data-review-action="archive" data-ticker="${escapeAttr(variant.ticker)}">Archive</button>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function advanceReview(variant, action) {
  if (!variant) return false;
  const stage = variant.reviewStage;
  if (action === "archive") {
    variant.reviewStage = "archived";
    variant.status = "retired";
    return true;
  }
  if (action !== "advance" || !reviewOrder.includes(stage) || stage === "published" || stage === "archived") {
    return false;
  }
  const index = reviewOrder.indexOf(stage);
  const next = reviewOrder[Math.min(index + 1, reviewOrder.indexOf("published"))];
  if (!next || next === stage || next === "archived") return false;
  variant.reviewStage = next;
  if (next === "published") variant.status = "research";
  return true;
}

function syncQueueFilterButtons() {
  elements.queueFilterButtons.forEach((button) => {
    const isActive = button.dataset.queueFilter === state.queueFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function safeReviewStage(stage) {
  return reviewOrder.includes(stage) ? stage : "draft";
}

function selectedVariant() {
  return variants.find((variant) => variant.ticker === state.selectedTicker) || variants[0] || null;
}

function metricFor(variant) {
  const metricsByTimeframe = variant && variant.metrics ? variant.metrics : {};
  const timeframeMetrics =
    metricsByTimeframe[state.timeframe] ||
    metricsByTimeframe["10Y"] ||
    Object.values(metricsByTimeframe)[0] ||
    {};
  const metrics =
    timeframeMetrics[state.cost] ||
    timeframeMetrics.estimatedNet ||
    Object.values(timeframeMetrics)[0] ||
    {};
  return { ...fallbackMetrics, ...metrics };
}

function benchmarkReturn() {
  const returnsByTimeframe = benchmarkReturns[state.benchmark] || benchmarkReturns.SPY || {};
  const selectedReturn = returnsByTimeframe[state.timeframe];
  if (Number.isFinite(selectedReturn)) return selectedReturn;
  const fallbackReturn = Object.values(returnsByTimeframe).find((value) => Number.isFinite(value));
  return Number.isFinite(fallbackReturn) ? fallbackReturn : 0;
}

function metricTile(label, value, className) {
  const safeClass = className ? ` ${classToken(className)}` : "";
  return `
    <div class="metric-tile${safeClass}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function statusLabel(status) {
  const labels = {
    research: "Research",
    "paper-live": "Paper-live",
    retired: "Retired"
  };
  return labels[status] || status;
}

function normalizeReportState(variant) {
  const timeframes = Object.keys((variant && variant.metrics) || {});
  if (timeframes.length && !timeframes.includes(state.timeframe)) {
    state.timeframe = timeframes.includes("10Y") ? "10Y" : timeframes[0];
  }

  const costOptions = Object.keys((variant && variant.metrics && variant.metrics[state.timeframe]) || {});
  if (costOptions.length && !costOptions.includes(state.cost)) {
    state.cost = costOptions.includes("estimatedNet") ? "estimatedNet" : costOptions[0];
  }

  const benchmarkOptions = Object.keys(benchmarkReturns);
  if (!benchmarkOptions.includes(state.benchmark)) {
    state.benchmark = benchmarkOptions[0] || "SPY";
  }

  syncSelectValue(elements.timeframeControl, state.timeframe);
  syncSelectValue(elements.costControl, state.cost);
  syncSelectValue(elements.benchmarkControl, state.benchmark);
}

function syncSelectValue(select, value) {
  if (!select || !select.options) return;
  const hasValue = Array.from(select.options).some((option) => option.value === value);
  if (hasValue) select.value = value;
}

function formatPct(value) {
  if (!Number.isFinite(value)) return "N/A";
  return `${value.toFixed(1)}%`;
}

function formatSignedPct(value) {
  if (!Number.isFinite(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function triggerLabel(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "bullish") return "Lower-band trigger";
  if (normalized === "bearish") return "Upper-band trigger";
  return type || "Research trigger";
}

function timestampFor(value) {
  const timestamp = new Date(`${value}T00:00:00`).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function numericSeed(key) {
  return [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function classToken(value) {
  return String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
}

function openWaitlist(opener = null) {
  if (!elements.waitlistModal) return;
  waitlistOpener = opener && typeof opener.focus === "function" ? opener : document.activeElement;
  if (elements.formMessage) elements.formMessage.textContent = "";
  if (!elements.waitlistModal.open) {
    if (typeof elements.waitlistModal.showModal === "function") {
      try {
        elements.waitlistModal.showModal();
      } catch (error) {
        elements.waitlistModal.setAttribute("open", "");
      }
    } else {
      elements.waitlistModal.setAttribute("open", "");
    }
  }
  window.requestAnimationFrame(() => {
    if (elements.emailInput) elements.emailInput.focus();
  });
}

function closeWaitlist() {
  if (!elements.waitlistModal || !elements.waitlistModal.open) return;
  if (typeof elements.waitlistModal.close === "function") {
    elements.waitlistModal.close();
  } else {
    elements.waitlistModal.removeAttribute("open");
  }
  window.requestAnimationFrame(() => {
    if (waitlistOpener && typeof waitlistOpener.focus === "function") {
      waitlistOpener.focus();
    }
    waitlistOpener = null;
  });
}

function handleWaitlistSubmit(event) {
  event.preventDefault();
  if (typeof elements.waitlistForm.reportValidity === "function" && !elements.waitlistForm.reportValidity()) {
    return;
  }

  const entry = {
    email: elements.emailInput ? elements.emailInput.value.trim() : "",
    interest: elements.interestInput ? elements.interestInput.value : "reports",
    price: elements.priceInput ? elements.priceInput.value : "not-sure",
    createdAt: new Date().toISOString()
  };

  if (!entry.email) {
    if (elements.formMessage) {
      elements.formMessage.textContent = "Enter an email to save research access interest.";
    }
    return;
  }

  const saveMode = saveInterest(entry);
  if (elements.formMessage) {
    elements.formMessage.textContent =
      saveMode === "local"
        ? "Saved locally for this prototype. No payment, trade instruction, or signal access was created."
        : "Saved for this session. Storage was unavailable, and no payment, trade instruction, or signal access was created.";
  }
  elements.waitlistForm.reset();
}

function saveInterest(entry) {
  const existing = readStoredInterest();
  existing.push(entry);
  memoryWaitlistEntries = existing;
  try {
    window.localStorage.setItem(waitlistStorageKey, JSON.stringify(existing));
    return "local";
  } catch (error) {
    return "memory";
  }
}

function readStoredInterest() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(waitlistStorageKey) || "[]");
    if (!Array.isArray(parsed)) return [...memoryWaitlistEntries];
    return parsed.filter((entry) => entry && typeof entry === "object" && typeof entry.email === "string");
  } catch (error) {
    return [...memoryWaitlistEntries];
  }
}

function debounce(callback, delay) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}
