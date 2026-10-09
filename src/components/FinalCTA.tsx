import { PrimaryButton } from "./ui/Button";
export function FinalCTA() {
  return (
    <section className="closing-cta" aria-labelledby="closing-title">
      <div className="studio-container">
        <span className="eyebrow">Your next chapter</span>
        <h2 id="closing-title">
          Let’s make your
          <br />
          first impression count.
        </h2>
        <div className="closing-cta-actions">
          <PrimaryButton>Start a conversation</PrimaryButton>
          <p>
            Tell us about your business.
            <br />
            We’ll work out the right next step together.
          </p>
        </div>
      </div>
    </section>
  );
}
