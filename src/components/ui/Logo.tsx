"use client";

import { motion } from "framer-motion";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-[30%] shadow-[0_0_18px_rgba(47,109,246,0.55)]"
        style={{
          background: "linear-gradient(155deg, #2f6df6 0%, #14224a 60%, #0a1226 100%)",
        }}
      />
      <div
        className="absolute inset-[6%] rounded-[26%] border border-white/15"
        style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.08), transparent 60%)" }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center font-black text-white"
        style={{ fontSize: size * 0.52, letterSpacing: -0.5 }}
      >
        N
      </span>
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full bg-accent-glow"
        style={{
          width: size * 0.14,
          height: size * 0.14,
          top: -size * 0.05,
          right: -size * 0.05,
          boxShadow: "0 0 8px 2px rgba(159,196,255,0.8)",
        }}
      />
    </div>
  );
}

export function Logo({ size = 34, wordmarkClassName = "" }: { size?: number; wordmarkClassName?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`text-sm font-semibold tracking-[0.2em] ${wordmarkClassName}`}>
        NOVUS <span className="text-accent-light">CO.</span>
      </span>
    </span>
  );
}
