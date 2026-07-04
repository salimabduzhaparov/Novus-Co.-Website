import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PopNumber } from "@/components/ui/PopNumber";
import { Icon } from "@/components/ui/Icon";
import { CtaBox } from "@/components/ui/CtaBox";
import { researchStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Statistics — Novus Co.",
  description: "Independent research on how a website affects local business trust and revenue.",
};

export default function StatisticsPage() {
  return (
    <>
      <PageHero
        kicker="Statistics"
        title="Why a website changes the outcome."
        subtitle="Independent, sourced research — not our own numbers."
      />

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {researchStats.map((s, i) => (
              <Reveal key={s.label} delay={(i % 3) * 0.08}>
                <div className="glass h-full rounded-2xl p-6 transition-shadow duration-300 hover:border-accent-light/40 hover:shadow-[0_16px_46px_rgba(47,109,246,0.18)]">
                  <PopNumber delay={(i % 3) * 0.06}>
                    <span
                      className="text-4xl font-black text-ink"
                      style={{ textShadow: "0 0 26px rgba(47,109,246,0.35)" }}
                    >
                      {s.value}
                    </span>
                  </PopNumber>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{s.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-silver">{s.desc}</p>
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-1.5 text-xs text-silver-dim transition-colors hover:text-accent-light"
                  >
                    <Icon name="externalLink" size={12} />
                    {s.source}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <CtaBox
              title="Ready to be on the right side of these numbers?"
              desc="Start a website preview and see what's possible for your business."
              ctaLabel="Start a Website Preview"
              ctaHref="/book"
            />
          </div>
        </div>
      </section>
    </>
  );
}
