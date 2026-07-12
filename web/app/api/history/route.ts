type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
        adjclose?: Array<{
          adjclose?: Array<number | null>;
        }>;
      };
    }>;
    error?: {
      description?: string;
    } | null;
  };
};

const RANGE_TO_DAYS: Record<string, number> = {
  "1y": 370,
  "3y": 370 * 3,
  "5y": 370 * 5,
  "10y": 370 * 10,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = sanitizeSymbol(url.searchParams.get("symbol"));
  const range = url.searchParams.get("range") ?? "max";
  if (!symbol) {
    return Response.json({ error: "Missing ETF symbol" }, { status: 400 });
  }

  const fetchedAt = new Date();
  const asOfDate = fetchedAt.toISOString().slice(0, 10);
  const period2 = Math.floor(Date.parse(`${asOfDate}T23:59:59.000Z`) / 1000);
  const yahooUrl = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
  if (range === "max" || range === "inception") {
    yahooUrl.searchParams.set("period1", "0");
    yahooUrl.searchParams.set("period2", String(period2));
  } else {
    const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS["5y"];
    const period1 = period2 - days * 24 * 60 * 60;
    yahooUrl.searchParams.set("period1", String(period1));
    yahooUrl.searchParams.set("period2", String(period2));
  }
  yahooUrl.searchParams.set("interval", "1d");
  yahooUrl.searchParams.set("events", "history");
  yahooUrl.searchParams.set("includeAdjustedClose", "true");

  try {
    const response = await fetch(yahooUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 agentic-trading-backtest",
      },
    });
    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const error = payload.chart?.error?.description;
    if (!response.ok || !result || error) {
      return Response.json({ error: error ?? `No Yahoo chart data for ${symbol}` }, { status: 502 });
    }

    const quote = result.indicators?.quote?.[0];
    const adjustedClose = result.indicators?.adjclose?.[0]?.adjclose ?? [];
    const timestamps = result.timestamp ?? [];
    const bars = timestamps.flatMap((timestamp, index) => {
      const open = quote?.open?.[index];
      const high = quote?.high?.[index];
      const low = quote?.low?.[index];
      const close = quote?.close?.[index];
      if (open == null || high == null || low == null || close == null || close <= 0) {
        return [];
      }
      const adjClose = adjustedClose[index] ?? close;
      const adjustment = adjClose / close;
      return [{
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        open: round(open * adjustment),
        high: round(high * adjustment),
        low: round(low * adjustment),
        close: round(adjClose),
        volume: quote?.volume?.[index] ?? null,
      }];
    });

    if (bars.length < 40) {
      return Response.json({ error: `${symbol} does not have enough daily history` }, { status: 422 });
    }

    return Response.json(
      {
        symbol,
        range,
        asOf: bars.at(-1)?.date ?? asOfDate,
        fetchedAt: fetchedAt.toISOString(),
        source: "Yahoo Finance chart",
        bars,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=900, stale-while-revalidate=21600",
        },
      },
    );
  } catch {
    return Response.json({ error: "Could not reach the live price source" }, { status: 502 });
  }
}

function sanitizeSymbol(value: string | null) {
  const symbol = (value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,12}$/.test(symbol)) return "";
  return symbol;
}

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}
