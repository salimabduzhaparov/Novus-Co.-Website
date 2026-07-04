import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { CtaBox } from "@/components/ui/CtaBox";
import { exampleReviews, reviewStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reviews — Novus Co.",
  description: "What it's like to work with Novus Co.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        kicker="Reviews"
        title="What clients say."
        subtitle="What it's like to work with Novus Co."
      >
        <div className="mt-8">
          <RatingBadge average={reviewStats.average} count={reviewStats.count} />
        </div>
      </PageHero>

      <section className="px-6 pt-14 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exampleReviews.map((r, i) => (
              <ReviewCard key={r.name} {...r} index={i} />
            ))}
          </div>

          <Reveal delay={0.15}>
            <p className="mt-10 text-center text-sm italic text-silver-dim">
              And many more positive client experiences.
            </p>
          </Reveal>

          <div className="mt-16">
            <CtaBox
              title="Ready to see what's possible for your business?"
              desc="Book a free preview and find out what a site like this could do for your leads."
              ctaLabel="Start a Website Preview"
              ctaHref="/book"
            />
          </div>
        </div>
      </section>
    </>
  );
}
