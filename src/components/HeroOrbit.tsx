"use client";

import { forwardRef } from "react";

const particles = [
  { top: "12%", left: "18%", delay: "0s", size: 5 },
  { top: "72%", left: "10%", delay: "0.8s", size: 4 },
  { top: "85%", left: "62%", delay: "1.6s", size: 6 },
  { top: "8%", left: "70%", delay: "2.2s", size: 4 },
  { top: "50%", left: "-2%", delay: "1.1s", size: 3 },
];

export const HeroOrbit = forwardRef<HTMLDivElement>(function HeroOrbit(_props, ref) {
  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center"
      style={{ width: 460, height: 460, willChange: "transform, opacity" }}
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: -40,
          background:
            "radial-gradient(circle, rgba(47,109,246,0.28) 0%, rgba(47,109,246,0.08) 45%, transparent 70%)",
        }}
      />

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent-glow animate-[float-particle_5s_ease-in-out_infinite]"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            boxShadow: "0 0 10px 2px rgba(159,196,255,0.6)",
          }}
        />
      ))}

      <div className="absolute inset-0 rounded-full border border-accent-light/[0.18]">
        <div className="absolute inset-0 animate-[orbit-spin_58s_linear_infinite] rounded-full" />
      </div>

      <div className="absolute rounded-full border border-accent-light/25" style={{ inset: 46 }}>
        <div className="absolute inset-0 animate-[orbit-spin_34s_linear_infinite_reverse] rounded-full">
          <span
            className="absolute rounded-full bg-white"
            style={{
              width: 11,
              height: 11,
              top: -5,
              left: "50%",
              marginLeft: -5,
              boxShadow: "0 0 24px 7px rgba(159,196,255,0.85)",
            }}
          />
        </div>
      </div>

      <div className="absolute rounded-full border border-accent-glow/30" style={{ inset: 96 }}>
        <div className="absolute inset-0 animate-[orbit-spin_22s_linear_infinite] rounded-full">
          <span
            className="absolute rounded-full bg-accent-light"
            style={{
              width: 7,
              height: 7,
              top: -3,
              left: "50%",
              marginLeft: -3,
              boxShadow: "0 0 16px 5px rgba(127,168,255,0.75)",
            }}
          />
        </div>
      </div>

      <div
        className="absolute rounded-full border border-accent-glow/50"
        style={{ inset: 148 }}
      />

      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-full text-white animate-[badge-breathe_5s_ease-in-out_infinite]"
        style={{
          width: 172,
          height: 172,
          background: "radial-gradient(circle at 35% 30%, #1a2c56, #0a1226)",
          boxShadow: "0 0 48px rgba(47,109,246,0.4), inset 0 0 24px rgba(127,168,255,0.16)",
          willChange: "transform",
        }}
      >
        <span className="text-[28px] font-black leading-none tracking-tight sm:text-3xl">NOVUS</span>
        <span className="mt-1 text-[11px] font-semibold tracking-[0.35em] text-accent-light">CO.</span>
      </div>
    </div>
  );
});
