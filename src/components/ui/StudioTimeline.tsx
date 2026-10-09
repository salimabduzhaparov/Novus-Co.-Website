"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import type { ScrollTrigger as ScrollTriggerInstance } from "gsap/ScrollTrigger";
import { novusProcessSteps, type ProcessStep } from "@/lib/process";
import styles from "./studio-timeline.module.css";

/**
 * Adapted from the Product Timeline supplied by the owner via 21st.dev.
 * Original source credit: Hyperiux Vault — https://vault.hyperiux.com
 * Retains its horizontal journey, alternating milestones and GSAP scroll
 * progress. Uses Novus process content, scoped selectors, no SplitText, and
 * an unpinned vertical layout for mobile, short viewports and reduced motion.
 */
export function StudioTimeline({
  steps = novusProcessSteps,
  className = "",
}: {
  steps?: readonly ProcessStep[];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<ScrollTriggerInstance | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!root || !viewport || !track || !progress) return;

    let disposed = false;
    let revert: (() => void) | undefined;
    root.dataset.ready = "true";

    const updateControls = (position: number) => {
      if (previousRef.current) previousRef.current.disabled = position <= 0.001;
      if (nextRef.current) nextRef.current.disabled = position >= 0.999;
    };
    const nativeScroll = () => {
      if (triggerRef.current) return;
      const distance = track.scrollWidth - viewport.clientWidth;
      updateControls(distance > 0 ? viewport.scrollLeft / distance : 1);
    };
    viewport.addEventListener("scroll", nativeScroll, { passive: true });
    nativeScroll();

    // The HTML and CSS are already usable. Load motion only for a suitable
    // desktop viewport; mobile and reduced-motion visitors never need GSAP.
    const query = window.matchMedia(
      "(min-width: 1100px) and (min-height: 760px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let loading = false;
    const enhance = async () => {
      if (!query.matches || disposed || loading || revert) return;
      loading = true;
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        revert = () => media.revert();
        media.add(query.media, () => {
          const distance = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);
          if (distance() < 1) return;
          viewport.scrollLeft = 0;
          root.dataset.enhanced = "true";
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top 104px",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => updateControls(self.progress),
              onRefresh: (self) => updateControls(self.progress),
            },
          });
          timeline.to(track, { x: () => -distance(), duration: 1 }, 0);
          timeline.fromTo(
            progress,
            { scaleX: 0.16 },
            { scaleX: 1, duration: 1 },
            0,
          );
          triggerRef.current = timeline.scrollTrigger ?? null;
          updateControls(triggerRef.current?.progress ?? 0);
          void document.fonts.ready.then(() => {
            if (!disposed) triggerRef.current?.refresh();
          });
          return () => {
            triggerRef.current = null;
            delete root.dataset.enhanced;
            nativeScroll();
          };
        });
      } catch {
        // Import or setup failures leave the normal scrollable timeline intact.
        revert?.();
        revert = undefined;
        delete root.dataset.enhanced;
      } finally {
        loading = false;
      }
    };
    void enhance();
    query.addEventListener("change", enhance);

    return () => {
      disposed = true;
      query.removeEventListener("change", enhance);
      viewport.removeEventListener("scroll", nativeScroll);
      revert?.();
      triggerRef.current = null;
      delete root.dataset.ready;
      delete root.dataset.enhanced;
    };
  }, [steps]);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const trigger = triggerRef.current;
    if (!viewport) return;
    if (trigger) {
      const target = Math.min(
        trigger.end,
        Math.max(
          trigger.start,
          window.scrollY + direction * viewport.clientWidth * 0.7,
        ),
      );
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      viewport.scrollBy({
        left: direction * viewport.clientWidth * 0.7,
        behavior: "smooth",
      });
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  return (
    <div ref={rootRef} className={`${styles.timeline} ${className}`}>
      <div className={styles.toolbar}>
        <p className={styles.caption}>
          <span>{String(steps.length).padStart(2, "0")} stages</span> From first
          conversation to what comes next.
        </p>
        <div className={styles.controls}>
          <span className={styles.nativeHint}>Explore each stage</span>
          <span className={styles.motionHint}>
            Scroll to follow the process
          </span>
          <button
            ref={previousRef}
            type="button"
            onClick={() => move(-1)}
            aria-label="Show earlier process stages"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M16 10H4m5-5-5 5 5 5" />
            </svg>
          </button>
          <button
            ref={nextRef}
            type="button"
            onClick={() => move(1)}
            aria-label="Show later process stages"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M4 10h12m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className={styles.viewport}
        role="region"
        aria-label="Website design process"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <ol ref={trackRef} className={styles.track}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.marker} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.content}>
                <h3>{step.title}</h3>
                <p className={styles.description}>{step.description}</p>
                <p className={styles.takeaway}>
                  <span>What you leave with</span>
                  {step.takeaway}
                </p>
              </div>
            </li>
          ))}
          <li className={styles.lineItem} aria-hidden="true">
            <span className={styles.line}>
              <span ref={progressRef} className={styles.progress} />
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
