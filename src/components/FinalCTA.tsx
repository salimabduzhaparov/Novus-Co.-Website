import { PrimaryButton } from "./ui/Button";

export function FinalCTA({
  title = "Put your business first.",
  description = "Get a free website preview built around your services.",
  variant = "standard",
}: {
  title?: string;
  description?: string;
  variant?: "standard" | "work";
}) {
  return (
    <section
      className="closing-cta"
      data-variant={variant}
      aria-labelledby="closing-title"
    >
      <div className="studio-container closing-cta-content">
        <h2 id="closing-title">
          {variant === "work" ? (
            <>
              <span className="closing-sentence">
                You take pride in your work.
              </span>{" "}
              <span className="closing-sentence">
                Your website should <em>show it.</em>
              </span>
            </>
          ) : (
            title
          )}
        </h2>
        {variant !== "work" && (
          <p className="closing-cta-description">{description}</p>
        )}
        <div className="closing-cta-actions">
          <PrimaryButton size="large">Request a free preview</PrimaryButton>
          {variant !== "work" && (
            <p className="closing-cta-reassurance">
              No payment. No commitment to a full build.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
