"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";

const palette = ["#7fa8ff", "#9b8cff", "#4fd6e8", "#5ee6a8"];

export function IndustryCard({
  name,
  icon,
  desc,
  index,
}: {
  name: string;
  icon: string;
  desc: string;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const color = palette[index % palette.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -7 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="group glass relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl px-6 py-8 text-center transition-shadow duration-300"
      style={{ boxShadow: hover ? `0 16px 46px ${color}33` : "none", borderColor: hover ? `${color}55` : undefined }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}26, transparent 70%)` }}
      />
      <motion.div
        whileHover={{ scale: 1.12, rotate: 6 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border animate-[badge-breathe_5s_ease-in-out_infinite]"
        style={{ borderColor: `${color}55`, color, animationDelay: `${(index % 8) * 0.3}s` }}
      >
        <Icon name={icon} size={24} />
      </motion.div>
      <span className="relative text-sm font-medium text-ink/90">{name}</span>

      <AnimatePresence>
        {hover && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="relative -mt-1 overflow-hidden text-xs leading-relaxed text-silver-dim"
          >
            {desc}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
