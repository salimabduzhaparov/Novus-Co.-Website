import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ProcessTimeline } from "@/components/ui/ProcessTimeline";
import { CtaBox } from "@/components/ui/CtaBox";
import { processStepsDetailed } from "@/lib/content";

export const metadata: Metadata = {
  title: "Process — Novus Co.",
  description: "How Novus Co. takes a business from first call to a live, working website.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        kicker="Process"
        title="How Novus Co. works."
        subtitle="Six steps, always visible, always moving toward one thing — a website that actually works for the business."
      />

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-2xl">
          <ProcessTimeline steps={processStepsDetailed} />

          <div className="mt-20">
            <CtaBox
              title="Ready to see it in motion?"
              desc="No commitment — just a look at what your business could look like online."
              ctaLabel="Start Your Website Preview"
              ctaHref="/book"
            />
          </div>
        </div>
      </section>
    </>
  );
}
