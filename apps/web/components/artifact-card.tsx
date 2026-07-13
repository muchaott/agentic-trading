import type { ResearchArtifact } from "@/types/research-artifact";

export function ArtifactCard({ artifact }: { artifact: ResearchArtifact }) {
  return (
    <article className="card">
      <p className={`status ${artifact.publication_state}`}>{artifact.publication_state}</p>
      <h3>{artifact.research_report.title}</h3>
      <p className="muted">{artifact.research_report.summary}</p>
      <div className="row">
        <span>{artifact.instrument.ticker}</span>
        <span>{artifact.strategy_variant.risk_band} risk</span>
        <span>{artifact.disclosure.performance_type.replaceAll("_", " ")}</span>
      </div>
      <p>
        <a
          href={`/research/${artifact.strategy_variant.slug}/${artifact.instrument.ticker.toLowerCase()}`}
        >
          Open report
        </a>
      </p>
    </article>
  );
}
