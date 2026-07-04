"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function FeaturePathLine({ nodes = 3 }: { nodes?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const fillWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative my-10 hidden h-px w-full sm:block" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-light/80 to-accent-glow"
        style={{ width: fillWidth }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-[8%]">
        {Array.from({ length: nodes }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-accent-glow"
            style={{ boxShadow: "0 0 14px 4px rgba(159,196,255,0.6)" }}
          />
        ))}
      </div>
    </div>
  );
}
