"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Icon } from "./ui/Icon";
import { BrowserMock } from "./ui/BrowserMock";
import { TrustDial } from "./ui/TrustDial";
import { edgePoints, trustSignal } from "@/lib/content";

const icons = ["target", "shield", "chart"];

export function CompetitiveEdge() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const gx = useTransform(scrollYProgress, [0, 1], [8, 35]);
  const gy = useTransform(scrollYProgress, [0, 1], [22, 48]);
  const bg = useMotionTemplate`radial-gradient(ellipse at ${gx}% ${gy}%, rgba(47,109,246,0.14) 0%, transparent 55%)`;

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 py-28 sm:px-10 sm:py-36">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: bg }}
      />
      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          kicker="Competitive Edge"
          title="Win trust before the first call."
        />

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[23px] hidden h-px bg-gradient-to-r from-accent-light/50 via-accent-light/20 to-transparent sm:block" />
          <div className="grid gap-10 sm:grid-cols-3">
            {edgePoints.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="relative">
                  <div className="relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-accent-glow/60 bg-void text-accent-light shadow-[0_0_16px_rgba(159,196,255,0.25)]">
                    <Icon name={icons[i]} size={18} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-silver">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-24 grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-2xl border border-hairline bg-white/[0.02] p-6">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-silver-dim">
                Nearby competitor
              </div>
              <BrowserMock tone="outdated" />
              <div className="mt-5 flex justify-center">
                <TrustDial value={trustSignal.outdated} label="Trust signal" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent-glow/60 bg-void text-xs font-semibold text-accent-light shadow-[0_0_24px_rgba(159,196,255,0.35)]"
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-accent-glow/40"
              />
              VS
            </motion.div>

            <div className="rounded-2xl border border-accent-light/50 bg-accent/10 p-6 shadow-[0_0_50px_rgba(47,109,246,0.16)]">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent-light">
                You, with Novus
              </div>
              <BrowserMock tone="clean" />
              <div className="mt-5 flex justify-center">
                <TrustDial value={trustSignal.clean} label="Trust signal" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
