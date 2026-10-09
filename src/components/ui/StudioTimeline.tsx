"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";

type StudioStep = {
  title: string;
  description: string;
  takeaway: string;
};

/**
 * Original Novus implementation of a scroll-linked timeline pattern.
 * No third-party component source copied. Progress is decorative;
 * every stage remains visible without JavaScript or animation.
 */
export function StudioTimeline({ steps }: { steps: StudioStep[] }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.7", "end 0.75"],
  });

  return (
    <div ref={timelineRef} className="relative">
      <div
        className="pointer-events-none absolute top-5 bottom-8 left-[17px] w-px bg-ink/15 sm:left-[23px]"
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute top-5 bottom-8 left-[17px] w-px origin-top bg-accent motion-reduce:hidden sm:left-[23px]"
        style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
        aria-hidden="true"
      />
      <ol aria-label="Project stages">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[36px_1fr] gap-x-5 pb-14 last:pb-0 sm:grid-cols-[48px_1fr] sm:gap-x-9 sm:pb-20 lg:grid-cols-[48px_0.8fr_1.2fr] lg:gap-x-12"
          >
            <span
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-void text-sm font-medium tabular-nums text-accent sm:h-12 sm:w-12 sm:text-base"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="pt-0.5 text-2xl leading-tight font-medium tracking-[-0.03em] sm:pt-1.5 sm:text-3xl lg:text-[2.15rem]">
              {step.title}
            </h2>
            <div className="col-start-2 mt-4 lg:col-start-auto lg:mt-0 lg:pt-1.5">
              <p className="page-copy">{step.description}</p>
              <p className="mt-6 text-sm font-medium text-ink">
                <span className="text-silver">At this stage: </span>
                {step.takeaway}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
