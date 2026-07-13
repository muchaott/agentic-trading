import { ArtifactCard } from "@/components/artifact-card";
import { getFeaturedArtifacts } from "@/lib/artifacts";

export default async function ResearchPage() {
  const artifacts = await getFeaturedArtifacts();

  return (
    <main>
      <section className="section">
        <h1>Research catalog</h1>
        <p className="muted">
          Production catalog pages should show only published artifacts. This
          setup page includes a draft fixture so the ingestion and display
          contract can be tested before data vendors are connected.
        </p>
        <div className="grid">
          {artifacts.map((artifact) => (
            <ArtifactCard artifact={artifact} key={artifact.artifact_id} />
          ))}
        </div>
      </section>
    </main>
  );
}
