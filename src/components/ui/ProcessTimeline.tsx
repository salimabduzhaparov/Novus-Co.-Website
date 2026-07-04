"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./Reveal";
import { PopNumber } from "./PopNumber";

export function ProcessTimeline({
  steps,
}: {
  steps: { title: string; detail: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.45"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />
      <motion.div
        style={{ height: lineHeight }}
        className="absolute left-[19px] top-2 w-px bg-gradient-to-b from-accent-light to-accent-glow shadow-[0_0_12px_rgba(127,168,255,0.6)]"
      />
      <div className="space-y-12">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={(i % 4) * 0.06}>
            <div className="relative flex gap-6">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-glow/60 bg-void text-sm font-semibold text-accent-light shadow-[0_0_16px_rgba(159,196,255,0.25)] animate-[badge-breathe_4s_ease-in-out_infinite]">
                <PopNumber delay={(i % 4) * 0.06 + 0.1}>{i + 1}</PopNumber>
              </div>
              <div className="pt-1.5">
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="max-w-lg text-sm leading-relaxed text-silver">{step.detail}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
