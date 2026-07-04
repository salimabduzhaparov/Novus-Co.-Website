import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { OrbitMark } from "./OrbitMark";

export function PageHero({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-40 sm:px-10 sm:pb-28 sm:pt-48">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(47,109,246,0.16) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <div className="mb-7 flex justify-center opacity-80">
            <OrbitMark size={56} />
          </div>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent-light/70" />
            <span
              className="text-xs font-bold tracking-[0.32em] text-accent-light uppercase"
              style={{ textShadow: "0 0 18px rgba(127,168,255,0.55)" }}
            >
              {kicker}
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent-light/70" />
          </div>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-xl text-balance text-silver">{subtitle}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
