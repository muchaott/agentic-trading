import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the ETF strategy dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ETF Inception Backtester<\/title>/i);
  assert.match(html, /Strategy 2: ETF Inception Backtester/);
  assert.match(html, /Since inception/);
  assert.match(html, /ETF universe/);
  assert.match(html, /Signal Log/);
  assert.match(html, /Run Notes/);
  assert.match(html, /SPDR S&amp;P 500 ETF Trust/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the finished app free of starter preview wiring", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /runBacktest/);
  assert.match(page, /classifySignal/);
  assert.match(layout, /ETF Inception Backtester/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/i);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
