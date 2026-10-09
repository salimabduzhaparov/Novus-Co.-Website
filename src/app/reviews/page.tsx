import type { Metadata } from "next";
import { FinalCTA } from "@/components/FinalCTA";
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
      <FinalCTA />
    </>
  );
}
