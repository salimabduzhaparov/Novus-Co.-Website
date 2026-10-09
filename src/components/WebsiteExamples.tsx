"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./website-examples.module.css";

type PreviewKind = "bluepeak" | "mike";

function TradeIcon({ kind }: { kind: "water" | "power" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {kind === "water" ? (
        <path
          d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function BluepeakHero() {
  return (
    <div className={styles.bluepeakSite}>
      <div className={styles.bluepeakNav}>
        <Image
          className={styles.bluepeakLogo}
          src="/work-assets/bluepeak-logo.webp"
          alt=""
          width={840}
          height={280}
          sizes="240px"
        />
        <span className={styles.miniNavLinks}>
          Our services &nbsp;&nbsp; About us
        </span>
        <span className={styles.bluepeakNavCta}>Get in touch ↗</span>
      </div>
      <div className={styles.bluepeakHero}>
        <div className={styles.bluepeakCopy}>
          <span className={styles.bluepeakEyebrow}>Plumbing + Electrical</span>
          <p className={styles.bluepeakHeadline}>
            Every pipe.
            <br />
            Every wire.
            <br />
            <span>One team.</span>
          </p>
          <p className={styles.bluepeakDescription}>
            The two systems your home depends on.
            <br />
            One straightforward place to turn.
          </p>
          <span className={styles.bluepeakButton}>
            Request service <span>↗</span>
          </span>
          <div className={styles.bluepeakTradeRow}>
            <span>
              <TradeIcon kind="water" /> Plumbing
            </span>
            <span>
              <TradeIcon kind="power" /> Electrical
            </span>
          </div>
        </div>
        <div className={styles.bluepeakVisual}>
          <Image
            className={styles.bluepeakPhoto}
            src="/work-assets/bluepeak-electrician.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 320px"
          />
          <div className={styles.bluepeakPhotoShade} />
          <svg
            className={styles.systemLines}
            viewBox="0 0 280 400"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              className={styles.waterLineBase}
              d="M28 0v95q0 18 18 18h155q18 0 18 18v96q0 18-18 18H94q-18 0-18 18v137"
            />
            <path
              className={styles.powerLineBase}
              d="M72 0v67l161 63v181L153 350v50"
            />
            <path
              className={styles.waterLine}
              d="M28 0v95q0 18 18 18h155q18 0 18 18v96q0 18-18 18H94q-18 0-18 18v137"
            />
            <path
              className={styles.powerLine}
              d="M72 0v67l161 63v181L153 350v50"
            />
          </svg>
          <div className={styles.systemCaption}>
            <span /> Water. Power. Taken care of.
          </div>
          <div className={styles.bluepeakImageNote}>
            Illustrative photography
          </div>
        </div>
      </div>
      <div className={styles.bluepeakStrip}>
        <span>Repairs</span>
        <i />
        <span>Installations</span>
        <i />
        <span>Planned upgrades</span>
        <span>One connected home.</span>
      </div>
    </div>
  );
}

function MikeHero() {
  return (
    <div className={styles.mikeSite}>
      <div className={styles.mikeNav}>
        <span className={styles.mikeBrand}>
          <Image
            src="/work-assets/mike-logo.webp"
            alt=""
            width={160}
            height={160}
            sizes="48px"
          />
          <span>
            Mike the
            <br />
            Plumber
          </span>
        </span>
        <span className={styles.miniNavLinks}>
          The work &nbsp;&nbsp; Services
        </span>
        <span className={styles.mikeNavCta}>Let’s talk ↗</span>
      </div>
      <div className={styles.mikeHero}>
        <div className={styles.mikeCopy}>
          <span className={styles.mikeEyebrow}>Sarasota, Florida</span>
          <p className={styles.mikeHeadline}>
            Nobody sees
            <br />
            the work
            <br />
            that matters.
          </p>
          <p className={styles.mikeDescription}>
            From behind the wall
            <br />
            to the finishing touches.
          </p>
          <span className={styles.mikeButton}>
            Talk to Mike <span>↗</span>
          </span>
          <span className={styles.mikeLanguage}>English & Español</span>
        </div>
        <div className={styles.mikeInspection}>
          <div className={styles.inspectionBar}>
            <span>A closer look</span>
            <i />
          </div>
          <div className={styles.mikeReveal}>
            <Image
              src="/work-assets/mike-rough-in.webp"
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 320px"
            />
            <div className={styles.finishedLayer}>
              <Image
                src="/work-assets/mike-finished-bath.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 320px"
              />
            </div>
            <div className={styles.revealDivider}>
              <span>‹ &nbsp; ›</span>
            </div>
            <span className={styles.finishedLabel}>The finish</span>
            <span className={styles.roughLabel}>The foundation</span>
          </div>
          <div className={styles.inspectionFooter}>
            <span>Good work goes deeper.</span>
            <span>↗</span>
          </div>
        </div>
      </div>
      <div className={styles.mikeStrip}>
        <span>Rough-in</span>
        <span>Remodel</span>
        <span>Repair</span>
        <span>Built around the details.</span>
      </div>
    </div>
  );
}

export function ConceptPreview({ kind }: { kind: PreviewKind }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let inView = false;
    const update = () => {
      stage.dataset.visible = String(
        inView && document.visibilityState === "visible",
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.12 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const bluepeak = kind === "bluepeak";
  const name = bluepeak ? "Bluepeak" : "Mike the Plumber";
  return (
    <div
      ref={stageRef}
      className={`${styles.projectStage} ${bluepeak ? styles.bluepeakStage : styles.mikeStage}`}
      data-paused={paused}
      data-visible="false"
    >
      <div className={styles.previewControls}>
        <span>
          <span className={styles.previewDot} />
          Hero exploration
        </span>
        <button
          type="button"
          aria-label={`${paused ? "Play" : "Pause"} ${name} preview animation`}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {paused ? (
              <path d="m5 3 8 5-8 5Z" fill="currentColor" />
            ) : (
              <path d="M5 3v10m6-10v10" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      <div
        className={styles.browser}
        role="img"
        aria-label={
          bluepeak
            ? "Bluepeak website concept. Navy and ice-blue design with a technician photograph, flowing plumbing and electrical lines, and a clear service request."
            : "Mike the Plumber website concept. His illustrated logo, warm neutral design, and an animated reveal between plumbing rough-in and a finished bathroom."
        }
      >
        <div className={styles.browserBar} aria-hidden="true">
          <span className={styles.browserDots}>
            <i />
            <i />
            <i />
          </span>
          <span>
            {bluepeak ? "Bluepeak Plumbing & Electrical" : "Mike the Plumber"}
          </span>
          <span>↗</span>
        </div>
        <div aria-hidden="true">
          {bluepeak ? <BluepeakHero /> : <MikeHero />}
        </div>
      </div>
    </div>
  );
}

const examples = [
  {
    kind: "bluepeak" as const,
    title: "Bluepeak",
    sector: "Plumbing & electrical",
    description: "Two trades. One confident first impression.",
    intent:
      "A connected visual language for plumbing and electrical work. Subtle flowing lines tie the two services together while the layout gives customers one clear route to request help.",
    details: [
      "A distinct identity for both trades",
      "Motion that explains the service",
      "A prominent service request",
    ],
  },
  {
    kind: "mike" as const,
    title: "Mike the Plumber",
    sector: "Plumbing & remodeling",
    description: "Bring the work behind the walls into view.",
    intent:
      "The original illustrated logo meets a more considered, materials-led website. A moving inspection window connects the visible finish with the plumbing behind it, making the craft the centre of the story.",
    details: [
      "Existing character, clearer presentation",
      "A behind-the-wall reveal",
      "An approachable route to contact",
    ],
  },
];

export function WebsiteExamples({ full = false }: { full?: boolean }) {
  return (
    <section
      className={`section-space ${styles.examplesSection} ${full ? styles.fullExamples : ""}`}
      aria-labelledby={full ? undefined : "website-examples-title"}
    >
      <div className="studio-container">
        {!full && (
          <div className={styles.examplesIntro}>
            <div>
              <p className={styles.sectionLabel}>Website explorations</p>
              <h2 id="website-examples-title">
                Your business.
                <br />
                Its own presence.
              </h2>
            </div>
            <div>
              <p>
                Two trade businesses. Two distinct ways to show the work and
                make the next step clear.
              </p>
              <Link href="/work" className={styles.textLink}>
                A closer look <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        )}
        <div className={styles.projectCollection}>
          {examples.map((example) => (
            <article
              key={example.kind}
              className={styles.project}
              id={example.kind === "mike" ? "mike-the-plumber" : "bluepeak"}
            >
              <ConceptPreview kind={example.kind} />
              <div className={styles.projectInfo}>
                <div className={styles.projectHeading}>
                  <h3>{example.title}</h3>
                  <span className={styles.conceptBadge}>Website concept</span>
                </div>
                <p className={styles.projectSector}>{example.sector}</p>
                <p className={styles.projectDescription}>
                  {example.description}
                </p>
                {full && (
                  <>
                    <p className={styles.projectIntent}>{example.intent}</p>
                    <ul className={styles.projectDetails}>
                      {example.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className={styles.conceptDisclosure}>
          Website design explorations, shown to demonstrate our approach. These
          previews do not claim client approval or business results.
        </p>
      </div>
    </section>
  );
}
