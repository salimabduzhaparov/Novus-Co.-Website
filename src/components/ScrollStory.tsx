"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PrimaryButton } from "./ui/Button";
import styles from "./scroll-story.module.css";

const FRAME_COUNT = 96;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Scroll geometry adapted from Pulkit's Scroll-Linked Video Scrubber on 21st.dev:
 * https://21st.dev/@pulkitxm/components/scroll-linked-video-scrubber.
 * Original implementation of the scroll-mapping concept; no source package copied.
 * Higgsfield film frames replace per-scroll video seeks. Decoded frame memory is
 * bounded; only nearby frames load, and reduced-motion/data-saving users get a poster.
 */
export function ScrollStory({ evidence }: { evidence: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const section = root.current;
    const surface = canvas.current;
    if (!section || !surface) return;
    const context = surface.getContext("2d", { alpha: false });
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const frames = new Map<number, ImageBitmap>();
    const pending = new Set<number>();
    const abort = new AbortController();
    let disposed = false;
    let target = 0;
    let drawn = -1;
    let raf = 0;
    let lastStage = -1;
    const chapters = [
      ...section.querySelectorAll<HTMLElement>("[data-story-chapter]"),
    ];

    const drawNearest = () => {
      if (!frames.size || disposed) return;
      const nearest = [...frames.keys()].reduce((a, b) =>
        Math.abs(a - target) < Math.abs(b - target) ? a : b,
      );
      if (nearest === drawn) return;
      const bitmap = frames.get(nearest)!;
      context.drawImage(bitmap, 0, 0, surface.width, surface.height);
      drawn = nearest;
      surface.dataset.ready = "true";
      surface.dataset.frame = String(nearest);
    };
    const requestFrame = (index: number) => {
      if (
        index < 0 ||
        index >= FRAME_COUNT ||
        pending.has(index) ||
        frames.has(index) ||
        pending.size >= 3 ||
        disposed
      )
        return;
      pending.add(index);
      fetch(
        `/media/customer-search/frames/${String(index + 1).padStart(3, "0")}.webp`,
        { signal: abort.signal },
      )
        .then((response) => {
          if (!response.ok) throw new Error("Frame unavailable");
          return response.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then((bitmap) => {
          if (disposed) {
            bitmap.close();
            return;
          }
          frames.set(index, bitmap);
          if (frames.size > 18) {
            const farthest = [...frames.keys()].sort(
              (a, b) => Math.abs(b - target) - Math.abs(a - target),
            )[0];
            frames.get(farthest)?.close();
            frames.delete(farthest);
          }
          drawNearest();
        })
        .catch(() => {
          /* The original image remains a usable fallback. */
        })
        .finally(() => {
          pending.delete(index);
          if (!disposed && !frames.has(target) && index !== target)
            requestFrame(target);
        });
    };
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = clamp(
        (88 - rect.top) / Math.max(1, rect.height - (window.innerHeight - 88)),
      );
      let stage = 0;
      chapters.forEach((chapter, i) => {
        if (chapter.getBoundingClientRect().top <= window.innerHeight * 0.56)
          stage = i;
      });
      if (stage !== lastStage) {
        lastStage = stage;
        setActive(stage);
      }
      section.style.setProperty("--story-progress", String(progress));
      if (
        paused ||
        reduced.matches ||
        connection?.saveData ||
        !("createImageBitmap" in window)
      )
        return;
      target = Math.round(progress * (FRAME_COUNT - 1));
      drawNearest();
      requestFrame(target);
      requestFrame(target + 1);
      requestFrame(target - 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    schedule();
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      resize.disconnect();
      frames.forEach((frame) => frame.close());
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
          <canvas
            ref={canvas}
            width={960}
            height={540}
            className={styles.frames}
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
              <PrimaryButton>Request a free preview</PrimaryButton>
              <Link href="/work">
                Explore our work <span aria-hidden="true">↗</span>
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
              A leaking pipe. A faulty socket. A roof that needs attention.
              Their search starts with a simple question: who can help?
            </p>
            <div className={styles.chapterNote}>
              “Plumber in Tampa”
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
              What services do you offer? Do you work in their area? Can they
              see examples of your work? With no website to explore, those
              answers are harder to find.
            </p>
            <div className={styles.chapterNote}>
              A confusing website creates doubt.
              <br />
              <span>No website can leave even more unanswered.</span>
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

function SearchScreen({ active }: { active: number }) {
  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome}>
        <span>● ● ●</span>
        <span>
          {active === 4 ? "A clear business website" : "A local search"}
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
            <strong>plumber in Tampa</strong>
            <i />
          </div>
          <div className={styles.searchTabs}>
            Local businesses <span>Map</span>
            <span>Photos</span>
          </div>
          <div className={styles.result} data-selected={active === 1}>
            <span className={styles.businessIcon}>⌖</span>
            <div>
              <strong>A nearby plumbing business</strong>
              <p>Plumbing services · Tampa</p>
              <small>Directions &nbsp; · &nbsp; Call</small>
            </div>
          </div>
          <div className={styles.result} data-selected={active === 3}>
            <span className={styles.businessIcon}>↗</span>
            <div>
              <strong>Another local plumber</strong>
              <p>Services, recent work &amp; contact details</p>
              <small className={styles.websitePill}>Visit website ↗</small>
            </div>
          </div>
          <div className={styles.searchHint}>
            {active === 3
              ? "Their next option is one click away."
              : "Looking for the right business to call…"}
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
            <span>⌖</span>
            <i />
            <i />
          </div>
          <h3>A nearby plumbing business</h3>
          <p>Plumbing services · Tampa</p>
          <div className={styles.listingActions}>
            <span>↗ Directions</span>
            <span>◔ Call</span>
            <span>↗ Share</span>
          </div>
          <div className={styles.noWebsite}>
            <span>?</span>
            <div>
              <strong>No website linked</strong>
              <p>Services? Recent work? Service area?</p>
            </div>
          </div>
          <div className={styles.questionPills}>
            <span>Where can I learn more?</span>
            <span>Is this the right fit?</span>
          </div>
          <Cursor className={styles.backCursor} />
        </div>

        <div className={styles.websitePanel} data-visible={active === 4}>
          <div className={styles.mockNav}>
            <strong>
              Your business<span>.</span>
            </strong>
            <span>Services &nbsp; Our work</span>
          </div>
          <span className={styles.mockLabel}>
            LOCAL EXPERTISE. EASY TO REACH.
          </span>
          <h3>
            The help you need.
            <br />
            <em>Right here.</em>
          </h3>
          <p>
            Know what we do. See the work.
            <br />
            Tell us how we can help.
          </p>
          <span className={styles.mockButton}>
            Request a quote <span>↗</span>
          </span>
          <Cursor className={styles.quoteCursor} />
        </div>
      </div>
    </div>
  );
}
