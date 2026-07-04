import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About — Novus Co.",
  description: "Why Novus Co. exists, and who it's built for.",
};

function Kicker({ children }: { children: string }) {
  return (
    <div className="mb-4 text-xs font-semibold tracking-[0.25em] text-accent-light uppercase">
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About"
        title="Why Novus exists."
        subtitle="Local service businesses do great work — their websites rarely show it. Novus Co. exists to close that gap."
      />

      <section className="px-6 pb-20 sm:px-10 sm:pb-28">
        <div className="mx-auto max-w-3xl space-y-16">
          <Reveal>
            <Kicker>Mission</Kicker>
            <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Help local service businesses look as professional online as
              they are in real life — with clean, modern, high-converting
              websites that build trust, attract more leads, and give
              business owners a stronger competitive edge.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Kicker>Vision</Kicker>
            <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Become the go-to digital partner for local service businesses
              that want to grow, compete, and modernize without being priced
              out by traditional agencies.
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <Kicker>What we aim to do</Kicker>
            <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Premium design, without the agency overhead.
            </h2>
            <div className="mt-6 space-y-4 text-silver">
              <p>
                Most home-service businesses are excellent at the work they
                do, but their website rarely shows it — outdated, slow,
                generic, or missing entirely. Meanwhile, customers decide who
                to call based on a first impression that happens online, in
                seconds, long before the phone ever rings.
              </p>
              <p>
                Novus Co. exists to close that gap. We build clean, modern,
                mobile-first websites specifically for local service
                businesses — plumbers, electricians, HVAC techs,
                landscapers, and everyone in between — structured around one
                outcome: turning a visit into a booked call.
              </p>
              <p>
                Every project starts with understanding the actual business,
                not a template. We keep the process simple, the
                communication direct, and the result sized to fit a local
                business — not a scaled-down enterprise package, and not an
                inflated agency retainer either.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
