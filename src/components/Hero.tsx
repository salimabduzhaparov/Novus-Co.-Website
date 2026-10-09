import { PrimaryButton, TextLink } from "./ui/Button";
import { Icon } from "./ui/Icon";
import styles from "./novus-hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`studio-container ${styles.layout}`}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>
            Websites for local service businesses
          </span>
          <h1 id="home-title">
            They’re searching.
            <br />
            <em>
              Be the business
              <br />
              they choose.
            </em>
          </h1>
          <p>
            We build websites that show what you do, earn customer confidence,
            and make it easy to call or request a quote.
          </p>
          <div className={styles.actions}>
            <PrimaryButton>Request a free preview</PrimaryButton>
            <TextLink href="/services">Explore our services</TextLink>
          </div>
          <span className={styles.offer}>
            A website direction built around your business. No commitment to a
            full build.
          </span>
        </div>
        <div
          className={styles.visual}
          role="img"
          aria-label="Illustration of a clear local business website"
        >
          <div className={styles.orbitLine} aria-hidden="true" />
          <div className={styles.browser}>
            <div className={styles.browserBar}>
              <span>● ● ●</span>
              <span>YOUR BUSINESS, ONLINE</span>
              <span>↗</span>
            </div>
            <div className={styles.siteNav}>
              <strong>Your business.</strong>
              <span>Services &nbsp; Our work</span>
            </div>
            <div className={styles.screenBody}>
              <span className={styles.local}>LOCAL PEOPLE. SKILLED WORK.</span>
              <strong>
                Good at what you do.
                <br />
                <span>Easy to choose.</span>
              </strong>
              <p>
                Show your services. Share your work.
                <br />
                Give people a reason to get in touch.
              </p>
              <span className={styles.quote}>
                Request a quote <Icon name="arrow" size={13} />
              </span>
              <div className={styles.workLines}>
                <div>
                  <Icon name="home" />
                  <span>Your services</span>
                </div>
                <div>
                  <Icon name="target" />
                  <span>Your service area</span>
                </div>
                <div>
                  <Icon name="phone" />
                  <span>One clear next step</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.callout}>
            <span>
              <Icon name="check" size={16} />
            </span>
            <div>
              <strong>From a search to a conversation.</strong>
              <small>That’s what your website should help with.</small>
            </div>
          </div>
          <span className={styles.visualNote}>Website illustration</span>
        </div>
      </div>
      <div className={`studio-container ${styles.foot}`}>
        <span>Plumbers · Electricians · Roofers · Home services</span>
        <a href="#why-a-website">
          Why your website matters <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
