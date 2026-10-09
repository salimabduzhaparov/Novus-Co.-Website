import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { StudioTimeline } from "@/components/ui/StudioTimeline";

export const metadata: Metadata = {
  title: "Our Website Design Process",
  description:
    "See how Novus approaches website projects, from understanding your business and agreeing the scope to design, development, review, and launch.",
  alternates: { canonical: "/process" },
};

const steps = [
  {
    title: "Understand the business.",
    description:
      "We start with your services, customers, and the way enquiries reach you today. Your existing website, useful references, and the questions customers ask help establish what the new site needs to do.",
    takeaway: "A shared understanding of the project.",
  },
  {
    title: "Set a clear direction.",
    description:
      "We discuss the page structure, content, and visual direction. Before the build, we agree on the scope, review stages, price, and an estimated schedule that takes your content and feedback into account.",
    takeaway: "A defined scope and next steps.",
  },
  {
    title: "Design and refine.",
    description:
      "The direction becomes a design you can review. We look at how it presents the business, how the information reads, and how people will move through the pages. Your feedback helps refine the details within the agreed scope.",
    takeaway: "A design to review and approve.",
  },
  {
    title: "Build and check.",
    description:
      "We develop the pages, add the agreed content, and connect the contact or booking tools. We check the experience across screen sizes, test key interactions, and review the technical search foundations.",
    takeaway: "A working website ready for final review.",
  },
  {
    title: "Launch with a plan.",
    description:
      "After final approval, we coordinate the launch and check the published site. We go through the agreed access and handover details, with any ongoing hosting, maintenance, or future improvements handled according to your project scope.",
    takeaway: "A live site and clarity about what follows.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        kicker="Our process"
        title="Thoughtful work. Clear next steps."
        subtitle="A website takes shape through good decisions, useful feedback, and attention to the details. Here is how we approach it together."
      />
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-label="The five stages of a website project"
      >
        <StudioTimeline steps={steps} />
      </section>
      <section
        className="bg-white py-20 sm:py-28"
        aria-labelledby="prepare-heading"
      >
        <div className="studio-container grid gap-10 lg:grid-cols-2 lg:gap-20">
          <h2
            id="prepare-heading"
            className="max-w-lg text-balance text-3xl leading-tight font-medium tracking-[-0.03em] sm:text-5xl"
          >
            You can start with what you have.
          </h2>
          <div className="page-copy">
            <p>
              An existing website, a few photographs, or a clear idea of the
              services you offer is a useful starting point. You do not need to
              arrive with every word and image ready.
            </p>
            <p className="mt-5">
              We will identify the content the project needs and agree who is
              responsible for each part. Providing accurate business details,
              approved images, and timely feedback helps keep things moving.
            </p>
            <p className="mt-5">
              Timelines depend on the scope, content, and integrations. We
              discuss a realistic schedule for your project before work begins.
            </p>
          </div>
        </div>
      </section>
      <section
        className="studio-container section-space"
        aria-labelledby="process-next-step"
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <h2
              id="process-next-step"
              className="text-balance text-3xl font-medium tracking-[-0.03em] sm:text-5xl"
            >
              Start with your business.
            </h2>
            <p className="page-copy mt-5 max-w-xl">
              Share a little about what you do and what you want your website to
              make easier.
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
