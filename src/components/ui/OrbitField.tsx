"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const particles = [
  { top: "12%", left: "8%", delay: "0s", size: 4 },
  { top: "68%", left: "88%", delay: "1s", size: 5 },
  { top: "40%", left: "94%", delay: "2s", size: 3 },
  { top: "84%", left: "22%", delay: "1.6s", size: 4 },
  { top: "24%", left: "60%", delay: "2.4s", size: 3 },
];

export function OrbitField() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 340]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        style={{ y: y1, rotate: rot }}
        className="absolute -left-40 top-[18%] h-[520px] w-[520px] rounded-full border border-accent-light/[0.06]"
      >
        <div className="absolute inset-0 animate-[orbit-spin_120s_linear_infinite] rounded-full" />
      </motion.div>
      <motion.div
        style={{ y: y1, rotate: rot }}
        className="absolute -left-40 top-[18%] h-[380px] w-[380px] translate-x-[70px] translate-y-[70px] rounded-full border border-accent-light/[0.05]"
      >
        <div className="absolute inset-0 animate-[orbit-spin_90s_linear_infinite_reverse] rounded-full" />
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute -right-52 top-[62%] h-[620px] w-[620px] rounded-full border border-accent-glow/[0.05]"
      >
        <div className="absolute inset-0 animate-[orbit-spin_140s_linear_infinite] rounded-full" />
      </motion.div>

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent-light/40 animate-[float-particle_7s_ease-in-out_infinite]"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size, animationDelay: p.delay }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,109,246,0.05),transparent_60%)]" />
    </div>
  );
}
