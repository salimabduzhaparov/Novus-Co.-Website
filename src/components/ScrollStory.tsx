"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PrimaryButton } from "./ui/Button";
import styles from "./scroll-story.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Native video playback stays independent of scroll. Only the HTML chapters
 * change with scroll, using the section-progress concept researched on 21st.dev.
 * No frame fetching, canvas drawing or compressed-video seeking on scroll. */
export function ScrollStory({ evidence }: { evidence: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let raf = 0;
    let lastStage = -1;
    const chapters = [
      ...section.querySelectorAll<HTMLElement>("[data-story-chapter]"),
    ];
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const navHeight = innerWidth <= 760 ? 76 : 88;
      const progress = clamp(
        (navHeight - rect.top) /
          Math.max(1, rect.height - (innerHeight - navHeight)),
      );
      let stage = 0;
      chapters.forEach((chapter, i) => {
        if (chapter.getBoundingClientRect().top <= innerHeight * 0.56)
          stage = i;
      });
      if (stage !== lastStage) {
        lastStage = stage;
        setActive(stage);
      }
      section.style.setProperty("--story-progress", String(progress));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = film.current;
    const section = root.current;
    if (!video || !section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let visible = false;
    const syncPlayback = () => {
      const allowed = !paused && !reduced.matches && !connection?.saveData;
      if (!allowed || !visible || document.hidden) {
        video.pause();
        return;
      }
      if (!video.getAttribute("src"))
        video.src = "/media/customer-search/typing-loop.mp4";
      void video.play().catch(() => {
        /* Static poster remains usable if autoplay is unavailable. */
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(section);
    reduced.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [paused]);

  return (
    <section
      ref={root}
      className={styles.story}
      data-scene={active}
      data-paused={paused}
      aria-label="From a local search to a clear next step"
    >
      <div className={styles.filmControls}>
        <span>
          <i /> A customer’s next move
        </span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Resume story motion" : "Pause story motion"}
        >
          {paused ? "▷ Motion off" : "Ⅱ Pause motion"}
        </button>
      </div>
      <div className={styles.sticky}>
        <div className={styles.film} aria-hidden="true">
          <Image
            src="/media/customer-search/poster.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.poster}
          />
          <video
            ref={film}
            className={styles.video}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster="/media/customer-search/poster.webp"
            disablePictureInPicture
            onLoadedData={(event) => {
              event.currentTarget.dataset.ready = "true";
            }}
            onError={(event) => {
              delete event.currentTarget.dataset.ready;
            }}
          />
        </div>
        <div className={styles.shade} />
        <div className={styles.screenWrap} aria-hidden="true">
          <SearchScreen active={active} />
          <p className={styles.sceneCaption}>
            Illustrative search journey <span>0{Math.max(1, active)} / 04</span>
          </p>
        </div>
        <div className={styles.progressRail}>
          <span />
        </div>
      </div>

      <div className={`studio-container ${styles.chapters}`}>
        <article
          data-story-chapter
          className={`${styles.chapter} ${styles.hero}`}
        >
          <div className={styles.copy}>
            <span className={styles.label}>
              Websites for local service businesses
            </span>
            <h1>
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
              <PrimaryButton tone="light">Request a free preview</PrimaryButton>
              <Link href="/services">
                Explore our services <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <small>
              A direction built around your business. No commitment to a full
              build.
            </small>
            <a className={styles.scrollCue} href="#the-search">
              <span aria-hidden="true">↓</span> Follow the customer’s journey
            </a>
          </div>
        </article>

        <article id="the-search" data-story-chapter className={styles.chapter}>
          <MobileScreen active={1} />
          <div className={styles.copy}>
            <span className={styles.label}>01 / The search</span>
            <h2>
              Someone nearby
              <br />
              needs what <em>you do.</em>
            </h2>
            <p>
              A service they need. A place to visit. A problem to solve.
              Whatever your business does, their search starts with a question:
              who can help?
            </p>
            <div className={styles.chapterNote}>
              “Local businesses near me”
              <br />
              <span>A small search. A real decision.</span>
            </div>
          </div>
        </article>

        <article data-story-chapter className={styles.chapter}>
          <MobileScreen active={2} />
          <div className={styles.copy}>
            <span className={styles.label}>02 / The missing information</span>
            <h2>
              They find the listing.
              <br />
              <em>Then the questions.</em>
            </h2>
            <p>
              A missing, broken or outdated website can make customers question
              your professionalism—and whether you can solve their problem.
              Before you get a chance to speak, their confidence can slip away.
            </p>
            <div className={styles.chapterNote}>
              Your online presence shapes their first impression.
              <br />
              <span>Make it reflect the quality of your business.</span>
            </div>
          </div>
        </article>

        <article
          data-story-chapter
          className={`${styles.chapter} ${styles.evidenceChapter}`}
        >
          <MobileScreen active={3} />
          <div className={styles.copy}>{evidence}</div>
        </article>

        <article
          data-story-chapter
          className={`${styles.chapter} ${styles.approach}`}
        >
          <MobileScreen active={4} />
          <div className={styles.copy}>
            <span className={styles.label}>04 / The Novus approach</span>
            <h2>
              Turn that search
              <br />
              into a <em>clear next step.</em>
            </h2>
            <p>
              Your services. Your service area. Your real work. Novus brings the
              information together, so customers can understand your business
              and get in touch with confidence.
            </p>
            <ul className={styles.benefits}>
              <li>Services people can understand</li>
              <li>Work they can see for themselves</li>
              <li>A simple way to call or enquire</li>
            </ul>
            <a className={styles.approachLink} href="#home-services">
              How we make it happen <span aria-hidden="true">↓</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function MobileScreen({ active }: { active: number }) {
  return (
    <div className={styles.mobileScreen} aria-hidden="true">
      <SearchScreen active={active} />
      <p className={styles.sceneCaption}>
        Illustrative search journey <span>0{active} / 04</span>
      </p>
    </div>
  );
}

function Cursor({ className = "" }: { className?: string }) {
  return (
    <span className={`${styles.cursor} ${className}`}>
      <svg viewBox="0 0 26 34" fill="none">
        <path
          d="M3 2v27l7-7 5 10 5-3-5-9h9L3 2Z"
          fill="#fff"
          stroke="#132b48"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <i />
    </span>
  );
}

function ActionIcon({
  kind,
}: {
  kind: "website" | "directions" | "call" | "pin" | "check";
}) {
  const paths = {
    website: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" />
      </>
    ),
    directions: (
      <>
        <path d="m12 2 10 10-10 10L2 12 10-10Z" />
        <path d="M8 16v-5h7m-3-3 3 3-3 3" />
      </>
    ),
    call: <path d="m6 3 4 4-2 3c2 3 3 4 6 6l3-2 4 4-2 3C10 22 2 14 3 5l3-2Z" />,
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

function BusinessActions({ website = false }: { website?: boolean }) {
  return (
    <div className={styles.businessActions}>
      {website && (
        <span className={styles.websiteAction}>
          <ActionIcon kind="website" /> Website
        </span>
      )}
      <span>
        <ActionIcon kind="directions" /> Directions
      </span>
      <span>
        <ActionIcon kind="call" /> Call
      </span>
    </div>
  );
}

function SearchScreen({ active }: { active: number }) {
  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome}>
        <span>● ● ●</span>
        <span>
          {active === 4 ? "Your website, working together" : "A local search"}
        </span>
        <span>↗</span>
      </div>
      <div className={styles.browserStage}>
        <div
          className={styles.searchPanel}
          data-visible={active === 1 || active === 3}
        >
          <div className={styles.searchBrand}>
            <span>N</span> Nearby search
          </div>
          <div className={styles.searchBar}>
            <span>⌕</span>
            <strong>local businesses near me</strong>
            <i />
          </div>
          <div className={styles.searchTabs}>
            Local businesses <span>Map</span>
            <span>Photos</span>
          </div>
          <div className={styles.result} data-selected={active === 1}>
            <span className={styles.businessIcon}>
              <ActionIcon kind="pin" />
            </span>
            <div className={styles.resultBody}>
              <strong>Your Business</strong>
              <p>Local business · Your area</p>
              <BusinessActions />
            </div>
          </div>
          <div className={styles.result} data-selected={active === 3}>
            <span className={styles.businessIcon}>
              <ActionIcon kind="pin" />
            </span>
            <div className={styles.resultBody}>
              <strong>Another local business</strong>
              <p>Services, recent work & contact details</p>
              <BusinessActions website />
            </div>
          </div>
          <div className={styles.searchHint}>
            {active === 3
              ? "A website gives them somewhere to go next."
              : "Which business feels right for them?"}
          </div>
          <Cursor
            className={
              active === 3 ? styles.competitorCursor : styles.searchCursor
            }
          />
        </div>

        <div className={styles.listingPanel} data-visible={active === 2}>
          <div className={styles.back}>‹ &nbsp; Back to results</div>
          <div className={styles.map}>
            <span>
              <ActionIcon kind="pin" />
            </span>
          </div>
          <h3>Your Business</h3>
          <p>Local business · Your area</p>
          <div className={styles.listingTabs}>
            <span>Overview</span>
            <span>Updates</span>
            <span>Photos</span>
          </div>
          <BusinessActions />
          <div className={styles.noWebsite}>
            <span>?</span>
            <div>
              <strong>No website linked</strong>
              <p>One less way to see what you can do.</p>
            </div>
          </div>
          <div className={styles.questionPills}>
            <span>Can they help me?</span>
            <span>Where can I see their work?</span>
          </div>
          <Cursor className={styles.backCursor} />
        </div>

        <div className={styles.websitePanel} data-visible={active === 4}>
          <div className={styles.mockNav}>
            <strong>
              Your Business<span>.</span>
            </strong>
            <span>Services &nbsp; Our work &nbsp; Contact</span>
          </div>
          <div className={styles.websiteIntro}>
            <div>
              <span className={styles.mockLabel}>EXPERTISE, MADE VISIBLE.</span>
              <h3>
                Good at what you do.
                <br />
                <em>Easy to choose.</em>
              </h3>
              <p>
                A clear picture of your business.
                <br />A confident next step for your customer.
              </p>
            </div>
            <div className={styles.websiteSeal}>
              <ActionIcon kind="check" />
              <span>
                Built around
                <br />
                your business
              </span>
            </div>
          </div>
          <div className={styles.websiteBlocks}>
            <div>
              <ActionIcon kind="check" />
              <strong>Your services</strong>
              <p>What you do, explained clearly.</p>
            </div>
            <div>
              <ActionIcon kind="pin" />
              <strong>Your area</strong>
              <p>Where customers can find you.</p>
            </div>
          </div>
          <div className={styles.websiteWork}>
            <div className={styles.workMosaic}>
              <i />
              <i />
              <i />
            </div>
            <div>
              <strong>Show the quality of your work</strong>
              <p>Projects, photos and the details that make you different.</p>
            </div>
          </div>
          <div className={styles.websiteContact}>
            <div>
              <strong>Ready to talk?</strong>
              <span>A direct route from interest to enquiry.</span>
            </div>
            <span className={styles.mockButton}>
              Get in touch <span>↗</span>
            </span>
          </div>
          <Cursor className={styles.quoteCursor} />
        </div>
      </div>
    </div>
  );
}
