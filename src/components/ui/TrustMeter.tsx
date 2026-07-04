"use client";

import { motion } from "framer-motion";

export function TrustMeter({
  label,
  value,
  low = false,
}: {
  label: string;
  value: number;
  low?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-silver-dim">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className={`h-full rounded-full ${
            low
              ? "bg-white/25"
              : "bg-gradient-to-r from-accent to-accent-glow shadow-[0_0_10px_rgba(47,109,246,0.6)]"
          }`}
        />
      </div>
    </div>
  );
}
