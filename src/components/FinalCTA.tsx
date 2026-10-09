import { PrimaryButton } from "./ui/Button";

export function FinalCTA() {
  return (
    <section className="closing-cta" aria-labelledby="closing-title">
      <div className="studio-container">
        <div className="closing-cta-layout">
          <div className="closing-cta-copy">
            <span className="eyebrow">Your free website preview</span>
            <h2 id="closing-title">
              See your business
              <br />
              in a new light.
            </h2>
            <p className="closing-cta-description">
              A website direction shaped around your services, your brand and
              the customers you want to reach. See the possibilities before
              committing to a full build.
            </p>
            <div className="closing-cta-actions">
              <PrimaryButton tone="light" size="large">
                Request a free preview
              </PrimaryButton>
              <p className="closing-cta-reassurance">
                No payment. No commitment to a full build.
              </p>
            </div>
          </div>
          <div className="closing-preview" aria-hidden="true">
            <div className="closing-preview-label">
              <span>Your next chapter</span>
              <span>Website preview</span>
            </div>
            <div className="closing-preview-window">
              <div className="closing-preview-chrome">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>Your business, online</span>
              </div>
              <div className="closing-preview-page">
                <div className="closing-preview-nav">
                  <span className="closing-preview-brand">Your business</span>
                  <span>Services&nbsp;&nbsp; Our work&nbsp;&nbsp; Contact</span>
                </div>
                <div className="closing-preview-content">
                  <span className="closing-preview-kicker">
                    Local work. Clearly presented.
                  </span>
                  <strong>
                    Make the right
                    <br />
                    first impression.
                  </strong>
                  <p>
                    Your services. Your story.
                    <br />A clear next step.
                  </p>
                  <span className="closing-preview-action">
                    Get in touch <span>↗</span>
                  </span>
                </div>
                <div className="closing-preview-shape">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="closing-preview-footer">
                  <span>Built around your business</span>
                  <span>Novus Co.</span>
                </div>
              </div>
            </div>
            <div className="closing-preview-caption">
              <span>Designed for your business.</span>
              <span>Illustrative preview</span>
            </div>
          </div>
        </div>
        <ol
          className="closing-preview-steps"
          aria-label="How your free preview starts"
        >
          <li>
            <span>01</span>
            <div>
              <strong>Tell us about your business</strong>
              <p>Share your services and what you want to make easier.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>See a website direction</strong>
              <p>Explore a preview built around the conversation.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Decide what comes next</strong>
              <p>Discuss the full project when the direction feels right.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
