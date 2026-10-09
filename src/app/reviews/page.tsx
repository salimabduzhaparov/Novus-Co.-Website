import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "What to Expect When Working Together",
  description:
    "Learn how Novus approaches your website project: clear scope, space for feedback, practical design decisions, and an agreed plan for launch.",
  alternates: { canonical: "/reviews" },
};

const commitments = [
  {
    title: "A clear scope.",
    description:
      "We discuss the pages, features, content, and integrations your project needs. The proposal is the place to agree deliverables, costs, review stages, and timing.",
  },
  {
    title: "Room for your feedback.",
    description:
      "You know your business. The review stages give you a chance to check how the design and content represent it, with revisions handled within the agreed project scope.",
  },
  {
    title: "Design with a purpose.",
    description:
      "We consider what customers need to understand, the information they will look for, and how they can get in touch. Visual decisions should help that experience.",
  },
  {
    title: "A considered handover.",
    description:
      "We discuss launch, access, hosting, and any ongoing support as part of the project. You should understand which responsibilities sit with you and which are included in our scope.",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        kicker="Working together"
        title="What to expect."
        subtitle="Choosing someone to build your website is a considered decision. Here is the approach you can expect from Novus."
      />
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-label="Our approach to your project"
      >
        {commitments.map((commitment) => (
          <article
            key={commitment.title}
            className="grid gap-5 border-t border-ink/15 py-9 sm:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
          >
            <h2 className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {commitment.title}
            </h2>
            <p className="page-copy max-w-2xl">{commitment.description}</p>
          </article>
        ))}
      </section>
      <section
        className="bg-white py-20 sm:py-28"
        aria-labelledby="see-the-thinking"
      >
        <div className="studio-container grid gap-8 lg:grid-cols-2 lg:gap-20">
          <h2
            id="see-the-thinking"
            className="max-w-lg text-balance text-3xl leading-tight font-medium tracking-[-0.03em] sm:text-5xl"
          >
            Get a feel for the work.
          </h2>
          <div>
            <p className="page-copy max-w-xl">
              Explore the website concepts to see how we approach layout,
              content, and customer journeys for different businesses. Each
              concept is labelled so you know what you are looking at.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/work" className="button-primary">
                Explore website concepts
              </Link>
              <Link href="/process" className="button-secondary">
                See our process
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section
        className="studio-container section-space"
        aria-labelledby="expectations-next-step"
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2
              id="expectations-next-step"
              className="text-balance text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            >
              Let us talk through your project.
            </h2>
            <p className="page-copy mt-4 max-w-xl">
              Bring your questions, your existing site, or simply an idea of
              what needs to change.
            </p>
          </div>
          <Link href="/book" className="button-primary shrink-0">
            Start a conversation
          </Link>
        </div>
      </section>
    </>
  );
}
