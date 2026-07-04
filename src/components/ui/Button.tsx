"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

const MotionLink = motion.create(Link);

export function PrimaryButton({
  children,
  href = "/book",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(47,109,246,0.4)] transition-shadow hover:shadow-[0_0_56px_rgba(47,109,246,0.6)]"
    >
      {children}
    </MotionLink>
  );
}

export function SecondaryButton({
  children,
  href = "/services",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.035, borderColor: "rgba(127,168,255,0.8)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-medium text-ink/90"
    >
      {children}
    </MotionLink>
  );
}

export function TextLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <MotionLink
      href={href}
      whileHover="hover"
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-light"
    >
      {children}
      <motion.span
        variants={{ hover: { x: 4 } }}
        className="inline-flex"
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon name="arrow" size={15} />
      </motion.span>
    </MotionLink>
  );
}
