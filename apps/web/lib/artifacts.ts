import fixture from "../data/fixtures/research_artifacts/spy_mean_reversion_demo.json";
import type { ResearchArtifact } from "@/types/research-artifact";

// Fixture-backed until Supabase artifact ingestion is wired to approved objects.
const fixtures = [fixture as ResearchArtifact];

export async function getFeaturedArtifacts(): Promise<ResearchArtifact[]> {
  return fixtures;
}

export async function getArtifactByRoute(strategySlug: string, ticker: string) {
  const normalizedTicker = ticker.toUpperCase();

  return fixtures.find(
    (artifact) =>
      artifact.strategy_variant.slug === strategySlug &&
      artifact.instrument.ticker === normalizedTicker
  );
}
