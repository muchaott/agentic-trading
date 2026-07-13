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
  assert.match(html, /<title>ABC Strategy Lab<\/title>/i);
  assert.match(html, /saved TQQQ Strategy 1 is now part of the live lab/i);
  assert.match(html, /Strategy 1/);
  assert.match(html, /TQQQ Strategy 1 - Regime Switch/);
  assert.match(html, /Candidate A/);
  assert.match(html, /Candidate B/);
  assert.match(html, /Candidate C/);
  assert.match(html, /bad-timing stress/);
  assert.match(html, /Archived Strategy 2/);
  assert.match(html, /Current allocation/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the finished app free of starter preview wiring", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /runTqqqStrategy1/);
  assert.match(page, /runCandidateA/);
  assert.match(page, /runCandidateB/);
  assert.match(page, /runCandidateC/);
  assert.match(page, /Saved package snapshot: 2016-07-08 to 2026-07-07/);
  assert.match(page, /analyzeEntryTiming/);
  assert.match(page, /InteractiveBacktestChart/);
  assert.match(page, /chartRange/);
  assert.match(page, /Bad Timing Stress Test/);
  assert.match(page, /Worst start path/);
  assert.match(layout, /ABC Strategy Lab/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/i);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
