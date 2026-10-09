import { PrimaryButton } from "./ui/Button";

export function FinalCTA({
  title = "Put your business first.",
  description = "Get a free website preview built around your services.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="closing-cta" aria-labelledby="closing-title">
      <div className="studio-container closing-cta-content">
        <h2 id="closing-title">{title}</h2>
        <p className="closing-cta-description">{description}</p>
        <div className="closing-cta-actions">
          <PrimaryButton tone="light" size="large">
            Request a free preview
          </PrimaryButton>
          <p className="closing-cta-reassurance">
            No payment. No commitment to a full build.
          </p>
        </div>
      </div>
    </section>
  );
}
