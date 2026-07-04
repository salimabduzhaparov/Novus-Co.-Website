"use client";

import { motion } from "framer-motion";

export function TrustDial({ value, label }: { value: number; label: string }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: 200, height: 200 }}>
      <div className="absolute rounded-full border border-accent-light/[0.14]" style={{ inset: 0 }}>
        <div className="absolute inset-0 animate-[orbit-spin_26s_linear_infinite] rounded-full">
          <span
            className="absolute rounded-full bg-accent-glow"
            style={{ width: 6, height: 6, top: -3, left: "50%", marginLeft: -3, boxShadow: "0 0 14px 4px rgba(159,196,255,0.7)" }}
          />
        </div>
      </div>

      <svg width={148} height={148} viewBox="0 0 148 148" className="-rotate-90">
        <circle cx={74} cy={74} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
        <motion.circle
          cx={74}
          cy={74}
          r={r}
          fill="none"
          stroke="url(#dialGradient)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(47,109,246,0.6))" }}
        />
        <defs>
          <linearGradient id="dialGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f6df6" />
            <stop offset="100%" stopColor="#9fc4ff" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute flex flex-col items-center"
      >
        <span className="text-3xl font-black text-ink">{value}%</span>
        <span className="mt-1 max-w-[110px] text-center text-[10px] uppercase tracking-wide text-silver-dim">
          {label}
        </span>
      </motion.div>
    </div>
  );
}
