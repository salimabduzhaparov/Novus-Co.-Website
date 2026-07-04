"use client";

import { motion } from "framer-motion";
import { StarRating } from "./StarRating";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.replace(".", "")[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ReviewCard({
  name,
  business,
  rating,
  quote,
  index,
}: {
  name: string;
  business: string;
  rating: number;
  quote: string;
  index: number;
}) {
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -28 : 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, borderColor: "rgba(127,168,255,0.45)", boxShadow: "0 16px 46px rgba(47,109,246,0.18)" }}
      className="glass h-full rounded-2xl p-6"
    >
      <StarRating rating={rating} />
      <p className="mt-4 text-sm leading-relaxed text-ink/90">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-hairline pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent-glow text-xs font-bold text-void">
          {initials(name)}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-silver-dim">{business}</div>
        </div>
      </div>
    </motion.div>
  );
}
