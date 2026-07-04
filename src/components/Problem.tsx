"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { Icon } from "./ui/Icon";
import { BrowserMock } from "./ui/BrowserMock";
import { TrustMeter } from "./ui/TrustMeter";
import { TextLink } from "./ui/Button";
import { comparisonCards, problemStats, trustSignal } from "@/lib/content";

const meta = [
  { tone: "empty" as const, trust: trustSignal.noSite },
  { tone: "outdated" as const, trust: trustSignal.outdated },
  { tone: "clean" as const, trust: trustSignal.clean },
];

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-40, 60]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 py-28 sm:px-10 sm:py-36">
      <motion.div
        style={{ y: parallaxY }}
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 0.5, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border border-accent-light/[0.08]"
      >
        <div className="absolute inset-0 animate-[orbit-spin_60s_linear_infinite] rounded-full" />
      </motion.div>

      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          kicker="The Problem"
          title="Customers judge you online before they ever call."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problemStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -5, borderColor: "rgba(127,168,255,0.4)" }}
                className="glass h-full rounded-xl p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-accent-light/30 text-accent-light">
                  <Icon name={s.icon} size={17} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-ink">{s.label}</h3>
                <p className="text-xs leading-relaxed text-silver-dim">{s.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {comparisonCards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -6,
                  borderColor: c.tone === "good" ? "rgba(127,168,255,0.7)" : "rgba(255,255,255,0.18)",
                  boxShadow: c.tone === "good" ? "0 16px 46px rgba(47,109,246,0.22)" : "none",
                }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-2xl border p-6 ${
                  c.tone === "good"
                    ? "border-accent-light/50 bg-accent/10"
                    : "border-hairline bg-white/[0.02]"
                }`}
              >
                <BrowserMock tone={meta[i].tone} />
                <h3 className="mb-2 mt-5 text-lg font-semibold">{c.label}</h3>
                <p className="mb-5 text-sm leading-relaxed text-silver">{c.desc}</p>
                <TrustMeter
                  label="Customer trust signal"
                  value={meta[i].trust}
                  low={c.tone !== "good"}
                />
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10">
            <TextLink href="/statistics">See the research</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
