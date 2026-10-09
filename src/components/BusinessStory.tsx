"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./business-story.module.css";

const chapters = [
  {
    label: "01 / The missed opportunity",
    title: "A search. A question. A lost opportunity.",
    copy: "Someone needs the service you offer. They find your business, but cannot find enough information to take the next step. Another business is only a click away.",
    note: "No website means less room to explain why you are the right choice.",
    tab: "Missing information",
  },
  {
    label: "02 / The friction",
    title: "A website that makes people work can still lose them.",
    copy: "Hidden contact details. Vague services. Pages that are awkward on a phone. A website should answer questions, not create more of them.",
    note: "A bad website creates doubt. Having no website leaves even more questions unanswered.",
    tab: "A confusing website",
  },
  {
    label: "03 / The Novus approach",
    title: "Make the next step feel obvious.",
    copy: "We bring your services, service area, real work and contact options together. A clear website gives customers the information they need to decide—and an easy way to reach you.",
    note: "Clear services. Relevant proof. A direct path to an enquiry.",
    tab: "A clear next step",
  },
];

export function BusinessStory() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const section = root.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const entries = [
      ...section.querySelectorAll<HTMLElement>("[data-chapter]"),
    ];
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      // Percentage root margins use viewport width, so use height-based pixels.
      const top = Math.round(window.innerHeight * 0.3);
      const bottom = Math.round(window.innerHeight * 0.4);
      observer = new IntersectionObserver(
        (changes) => {
          for (const entry of changes) {
            if (entry.isIntersecting)
              setActive(Number((entry.target as HTMLElement).dataset.chapter));
          }
        },
        { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: 0 },
      );
      entries.forEach((el) => observer.observe(el));
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, []);
  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="story-title"
    >
      <div className="studio-container">
        <div className={styles.intro}>
          <span className="eyebrow">The problem → the solution</span>
          <h2 id="story-title">Help them choose you.</h2>
          <p>Here is where a better website makes a difference.</p>
        </div>
        <div className={styles.layout}>
          <div className={styles.chapters}>
            {chapters.map((chapter, i) => (
              <article
                className={styles.chapter}
                key={chapter.label}
                data-chapter={i}
                data-active={active === i}
              >
                <span className={styles.chapterLabel}>{chapter.label}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
                <p className={styles.note}>{chapter.note}</p>
                {i === 2 && (
                  <Link href="/services" className="text-link">
                    How we improve your website{" "}
                    <span aria-hidden="true">↗</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.device}>
              <div className={styles.chrome}>
                <span>● ● ●</span>
                <span>yourbusiness.com</span>
                <span>↗</span>
              </div>
              <div className={styles.stage}>
                <div className={styles.scene} data-visible={active === 0}>
                  <div className={styles.search}>⌕ &nbsp; plumber near me</div>
                  <div className={styles.listing}>
                    <span className={styles.pin}>⌖</span>
                    <div>
                      <strong>A local business</strong>
                      <p>Plumbing services · Nearby</p>
                    </div>
                  </div>
                  <div className={styles.map}>
                    <span>⌖</span>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className={styles.questions}>
                    <span>Do they offer the service I need?</span>
                    <span>Can I see their work?</span>
                    <span>Where can I find out more?</span>
                  </div>
                  <div className={styles.missing}>No website linked</div>
                </div>
                <div className={styles.scene} data-visible={active === 1}>
                  <div className={styles.clutter}>
                    <span>HOME &nbsp; MORE &nbsp; INFO</span>
                    <strong>
                      Welcome to
                      <br />
                      our website
                    </strong>
                    <p>We offer quality solutions for all your needs.</p>
                    <div className={styles.emptyImage}>Image unavailable</div>
                    <small>Looking for services? Contact details?</small>
                  </div>
                  <span className={styles.friction}>
                    Too much searching. Too little clarity.
                  </span>
                </div>
                <div
                  className={`${styles.scene} ${styles.clear}`}
                  data-visible={active === 2}
                >
                  <div className={styles.businessNav}>
                    <strong>Your business.</strong>
                    <span>Services &nbsp; Our work</span>
                  </div>
                  <span className={styles.tradeLabel}>
                    LOCAL EXPERTISE. EASY TO REACH.
                  </span>
                  <strong className={styles.mockTitle}>
                    The help you need.
                    <br />
                    <em>Right here.</em>
                  </strong>
                  <p>
                    What you do. Where you work.
                    <br />
                    What makes your business the right fit.
                  </p>
                  <span className={styles.mockCta}>Request a quote ↗</span>
                  <div className={styles.answerGrid}>
                    <span>✓ Services explained</span>
                    <span>✓ Service area shown</span>
                    <span>✓ Real work featured</span>
                    <span>✓ Easy to contact</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.caption}>
              <span>Illustrative customer journey</span>
              <span>0{active + 1} / 03</span>
            </div>
            <div className={styles.progress}>
              {chapters.map((c, i) => (
                <span key={c.tab} data-active={active >= i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
