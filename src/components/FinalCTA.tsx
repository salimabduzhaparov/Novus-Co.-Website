import { PrimaryButton } from "./ui/Button";
import { Reveal } from "./ui/Reveal";
export function FinalCTA() {
  return (
    <section className="closing-cta" aria-labelledby="closing-title">
      <div className="studio-container">
        <span className="eyebrow">Start with a free preview</span>
        <Reveal>
          <h2 id="closing-title">
            Let’s show you
            <br />
            what’s possible.
          </h2>
        </Reveal>
        <div className="closing-cta-actions">
          <PrimaryButton>Request a free preview</PrimaryButton>
          <p>
            Tell us about your business.
            <br />
            We’ll get in touch to arrange the next step.
          </p>
        </div>
      </div>
    </section>
  );
}
