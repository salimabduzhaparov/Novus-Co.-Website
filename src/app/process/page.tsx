import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { StudioTimeline } from "@/components/ui/StudioTimeline";
import { novusProcessSteps } from "@/lib/process";

export const metadata: Metadata = {
  title: "Our Website Design Process",
  description:
    "Follow the Novus website process: discover your business, design a preview, review it together, build, launch, and plan optional improvements.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        kicker="Our process"
        title="From first call to your new website."
        subtitle="Understand the business. Design the preview. Refine it together. Six clear stages, with your input at the points that matter."
      />
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-labelledby="process-stages"
      >
        <h2 id="process-stages" className="sr-only">
          The six stages of your website project
        </h2>
        <StudioTimeline steps={novusProcessSteps} />
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
