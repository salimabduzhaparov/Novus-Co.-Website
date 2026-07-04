"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";
import { Icon } from "./ui/Icon";
import { FeaturePathLine } from "./ui/FeaturePathLine";
import { solutionPoints } from "@/lib/content";
import { TextLink } from "./ui/Button";

const icons = ["layers", "phone", "shield", "target", "bolt", "chart"];
const xDirection = [-36, 0, 36];

function FeatureCard({
  point,
  icon,
  col,
  fromBelow,
}: {
  point: (typeof solutionPoints)[number];
  icon: string;
  col: number;
  fromBelow: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: xDirection[col], y: fromBelow ? 26 : -26 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: col * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -6,
        borderColor: "rgba(127,168,255,0.5)",
        boxShadow: "0 16px 46px rgba(47,109,246,0.2)",
      }}
      className="glass h-full rounded-2xl p-6"
    >
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-accent-light/30 text-accent-light">
        <Icon name={icon} size={18} />
      </div>
      <h3 className="mb-2 text-base font-semibold">{point.title}</h3>
      <p className="text-sm leading-relaxed text-silver">{point.desc}</p>
    </motion.div>
  );
}

export function Solution() {
  const row1 = solutionPoints.slice(0, 3);
  const row2 = solutionPoints.slice(3, 6);

  return (
    <section className="px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          kicker="The Solution"
          title="The website your work already deserves."
        />

        <div className="mt-14">
          <div className="grid gap-5 sm:grid-cols-3">
            {row1.map((p, i) => (
              <FeatureCard key={p.title} point={p} icon={icons[i]} col={i} fromBelow={false} />
            ))}
          </div>

          <FeaturePathLine />

          <div className="mt-5 grid gap-5 sm:mt-0 sm:grid-cols-3">
            {row2.map((p, i) => (
              <FeatureCard key={p.title} point={p} icon={icons[i + 3]} col={i} fromBelow />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <TextLink href="/services">View all services</TextLink>
        </div>
      </div>
    </section>
  );
}
