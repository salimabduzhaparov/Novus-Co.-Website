import { PrimaryButton, TextLink } from "./ui/Button";
import { OrbitalVisual } from "./OrbitalVisual";
export function Hero() {
  return (
    <section className="hero-section" aria-labelledby="home-title">
      <div className="studio-container">
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              Independent thinking. Local ambition.
            </span>
            <h1 id="home-title">
              Good work deserves
              <br />a <em>great website.</em>
            </h1>
            <p>
              We design thoughtful websites for local businesses. Clearer
              services, stronger first impressions, and an easier way to get
              in touch.
            </p>
            <div className="hero-actions">
              <PrimaryButton>Let’s talk about your website</PrimaryButton>
              <TextLink href="/work">Explore our work</TextLink>
            </div>
          </div>
          <OrbitalVisual />
        </div>
        <div className="hero-foot">
          <span>Web design & development for local service businesses</span>
          <span>
            Made to move your business forward <span aria-hidden="true">↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
