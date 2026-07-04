"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  subtitle,
  center = false,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={center ? "text-center" : ""}
    >
      <div className={`mb-5 inline-flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className="h-px w-9 bg-gradient-to-r from-accent-light to-transparent" />
        <span
          className="text-xs font-bold tracking-[0.32em] text-accent-light uppercase"
          style={{ textShadow: "0 0 18px rgba(127,168,255,0.55)" }}
        >
          {kicker}
        </span>
      </div>
      <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-balance text-silver ${center ? "mx-auto max-w-md" : "max-w-md"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
