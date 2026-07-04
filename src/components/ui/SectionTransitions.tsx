"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Problem → Solution: layered depth fade.
 * Two glow planes cross at different depths (z-axis push feel) instead of a single traveling dot.
 */
export function DepthFade() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const backScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.85]);
  const backOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.55, 0]);
  const frontScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  const frontOpacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const lineScaleX = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

  return (
    <div ref={ref} className="relative h-28 w-full overflow-hidden sm:h-36" aria-hidden="true">
      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          scale: backScale,
          opacity: backOpacity,
          background: "radial-gradient(circle, rgba(47,109,246,0.4), transparent 70%)",
        }}
      />
      <motion.div
        style={{ scaleX: lineScaleX }}
        className="absolute left-1/2 top-1/2 h-px w-2/3 -translate-x-1/2 -translate-y-1/2 origin-center bg-gradient-to-r from-transparent via-accent-light to-transparent"
      />
      <motion.span
        style={{ scale: frontScale, opacity: frontOpacity }}
        className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-glow"
        aria-hidden
      />
    </div>
  );
}

/**
 * Solution → Process: sequence reveal.
 * A row of nodes lights up left-to-right in sequence, foreshadowing Process's numbered steps.
 */
export function SequenceReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const nodeCount = 5;

  return (
    <div ref={ref} className="relative mx-auto h-24 w-full max-w-xs sm:h-28" aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
      <div className="absolute inset-0 flex items-center justify-between">
        {Array.from({ length: nodeCount }).map((_, i) => {
          const start = i / nodeCount;
          const end = start + 1 / nodeCount + 0.1;
          return <Node key={i} progress={scrollYProgress} start={start} end={end} />;
        })}
      </div>
    </div>
  );
}

function Node({
  progress,
  start,
  end,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const scale = useTransform(progress, [start, (start + end) / 2, end], [0.4, 1.3, 1]);
  const opacity = useTransform(progress, [start, (start + end) / 2], [0.25, 1]);
  return (
    <motion.span
      style={{ scale, opacity, boxShadow: "0 0 14px 4px rgba(159,196,255,0.55)" }}
      className="h-2.5 w-2.5 rounded-full bg-accent-glow"
    />
  );
}

/**
 * Process → Industries: clip-path horizontal wipe.
 * A clean band sweeps across, revealing the seam — geometric, not glowy.
 */
export function WipeReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const clip = useTransform(scrollYProgress, [0.15, 0.55], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const fade = useTransform(scrollYProgress, [0.55, 0.85], [1, 0]);

  return (
    <div ref={ref} className="relative h-20 w-full overflow-hidden sm:h-24" aria-hidden="true">
      <div className="absolute inset-x-[10%] top-1/2 h-px -translate-y-1/2 bg-white/8" />
      <motion.div
        style={{ clipPath: clip, opacity: fade }}
        className="absolute inset-x-[10%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent-light via-accent-glow to-accent-light"
      />
    </div>
  );
}

/**
 * Industries → Competitive Edge: soft ambient bloom.
 * A slow, wide radial bloom drifts upward — calmer, brand-story register.
 */
export function SoftBloom() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.4, 0.6]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div ref={ref} className="relative h-32 w-full overflow-hidden sm:h-40" aria-hidden="true">
      <motion.div
        style={{ scale, opacity, y }}
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: "radial-gradient(circle, rgba(127,168,255,0.5), transparent 72%)" }}
        />
      </motion.div>
    </div>
  );
}

/**
 * Competitive Edge → Final CTA: converging build-up.
 * Two angled light lines converge toward a central point that brightens — anticipation before the ask.
 */
export function ConvergeBuild() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const angle = useTransform(scrollYProgress, [0, 0.6], [38, 0]);
  const negAngle = useTransform(angle, (v) => -v);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);
  const glowScale = useTransform(scrollYProgress, [0.5, 0.85], [0.3, 1.6]);

  return (
    <div ref={ref} className="relative h-32 w-full overflow-hidden sm:h-40" aria-hidden="true">
      <motion.div
        style={{ opacity: lineOpacity, rotate: negAngle }}
        className="absolute left-1/2 top-1/2 h-px w-36 origin-right -translate-x-full -translate-y-1/2 bg-gradient-to-l from-accent-light to-transparent"
      />
      <motion.div
        style={{ opacity: lineOpacity, rotate: angle }}
        className="absolute left-1/2 top-1/2 h-px w-36 origin-left -translate-y-1/2 bg-gradient-to-r from-accent-light to-transparent"
      />
      <motion.div
        style={{ opacity: glowOpacity, scale: glowScale }}
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-glow"
      />
    </div>
  );
}
