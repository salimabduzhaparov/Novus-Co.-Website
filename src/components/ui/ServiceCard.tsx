"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { PopNumber } from "./PopNumber";
import type { services } from "@/lib/content";

export function ServiceCard({
  service,
  index,
  expandable = true,
}: {
  service: (typeof services)[number];
  index: number;
  expandable?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{
        y: -6,
        borderColor: "rgba(127,168,255,0.5)",
        boxShadow: "0 16px 46px rgba(47,109,246,0.22)",
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group glass h-full rounded-2xl p-7"
    >
      <div className="mb-5 flex items-center justify-between">
        <PopNumber delay={(index % 3) * 0.06}>
          <span
            className="text-2xl font-black text-accent-light/80"
            style={{ textShadow: "0 0 22px rgba(127,168,255,0.4)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </PopNumber>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-light/30 text-accent-light shadow-[0_0_0_rgba(47,109,246,0)] transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(47,109,246,0.35)]"
        >
          <Icon name={service.icon} size={18} />
        </motion.div>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
      <p className="text-sm leading-relaxed text-silver">{service.short}</p>

      {expandable && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-accent-light"
          >
            {open ? "Show less" : "Learn more"}
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              className="inline-flex text-sm leading-none"
            >
              +
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-4 text-sm leading-relaxed text-silver">{service.detail}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-silver-dim">
                  Best for
                </p>
                <p className="mt-1 text-sm text-ink/85">{service.who}</p>
                <ul className="mt-4 space-y-2">
                  {service.gets.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-sm text-ink/85">
                      <Icon name="check" size={14} className="mt-0.5 shrink-0 text-accent-light" />
                      {g}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
