"use client";

import { motion } from "framer-motion";
import { PrimaryButton } from "./Button";
import { OrbitMark } from "./OrbitMark";

export function CtaBox({
  title = "Not sure where to start?",
  desc = "Tell us what your business needs, and we'll recommend the cleanest path forward.",
  ctaLabel = "Start a Website Preview",
  ctaHref = "/book",
}: {
  title?: string;
  desc?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: "rgba(127,168,255,0.5)", boxShadow: "0 0 60px rgba(47,109,246,0.18)" }}
      className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 overflow-hidden rounded-2xl border border-hairline bg-white/[0.025] px-8 py-9 text-center sm:flex-row sm:gap-7 sm:px-9 sm:py-8 sm:text-left"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(47,109,246,0.1), transparent 60%)" }}
      />
      <div className="relative shrink-0 opacity-90">
        <OrbitMark size={52} />
      </div>
      <div className="relative flex-1">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-silver">{desc}</p>
      </div>
      <div className="relative shrink-0">
        <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
      </div>
    </motion.div>
  );
}
