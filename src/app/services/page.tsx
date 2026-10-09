import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Website Design Services for Local Businesses",
  description:
    "Explore Novus website design, redesign, landing pages, SEO foundations, enquiry forms, and booking integrations for local service businesses.",
  alternates: { canonical: "/services" },
};

const offerings = [
  {
    id: "business-websites",
    title: "Business websites",
    description:
      "Show customers what you do, where you work and why you are a good fit. We bring your services, project photos and contact details into a clear, mobile-friendly website.",
    scope: [
      "Page structure and content",
      "Visual design",
      "Responsive development",
    ],
    fit: "For businesses establishing an online presence or moving beyond a basic site.",
  },
  {
    id: "website-redesigns",
    title: "Website redesigns",
    description:
      "Fix a website that is dated, confusing or difficult to use on a phone. We review what customers need to find and redesign the pages around those decisions.",
    scope: [
      "Existing-site review",
      "Content refinement",
      "Design and usability improvements",
    ],
    fit: "For a dated, difficult-to-use website that no longer represents your work.",
  },
  {
    id: "landing-pages",
    title: "Landing pages",
    description:
      "One focused page for a specific service, offer, or campaign. A clear message, relevant information, and a straightforward next step for the visitor.",
    scope: [
      "Focused page design",
      "Offer and message structure",
      "Contact or enquiry action",
    ],
    fit: "For introducing a service, testing an idea, or giving a campaign its own destination.",
  },
  {
    id: "seo-foundations",
    title: "SEO foundations",
    description:
      "The technical and content basics that help search engines understand your website. We consider page structure, descriptive metadata, internal links, and your service information.",
    scope: [
      "Titles and descriptions",
      "Indexing and sitemap setup",
      "Service-page structure",
    ],
    fit: "For building search visibility on a sound foundation. Ongoing SEO is a separate scope; rankings are not guaranteed.",
  },
  {
    id: "enquiry-systems",
    title: "Enquiry systems",
    description:
      "Make it easier to ask for a quote and easier for you to receive the right information. We shape forms and contact routes around how your business handles new enquiries.",
    scope: [
      "Enquiry and quote forms",
      "Contact routing",
      "Agreed tracking integrations",
    ],
    fit: "For businesses that need a clearer path from a website visit to a useful enquiry.",
  },
  {
    id: "booking-integrations",
    title: "Booking integrations",
    description:
      "Connect your website with a suitable scheduling tool so customers can take the next step online. The booking flow depends on your services, availability, and chosen platform.",
    scope: [
      "Scheduling-tool integration",
      "Mobile booking experience",
      "Confirmation-flow checks",
    ],
    fit: "For appointment-based businesses. Platform subscriptions and capabilities are discussed during scoping.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Our services"
        title="Built for the next call, quote or booking."
        subtitle="Websites, redesigns, search foundations and enquiry tools for local service businesses. Clear services. Useful information. An easier way to reach you."
      />
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-label="Website services"
      >
        <nav className="page-mini-nav" aria-label="Jump to a service">
          {offerings.map((offering) => (
            <a key={offering.id} href={`#${offering.id}`}>
              {offering.title}
            </a>
          ))}
        </nav>
        <div className="services-grid">
          {offerings.map((offering, index) => (
            <Reveal key={offering.id} delay={(index % 2) * 0.08}>
              <article id={offering.id} className="service-detail">
                <div className="service-index">
                  <Icon
                    name={
                      [
                        "layers",
                        "refresh",
                        "target",
                        "chart",
                        "mail",
                        "calendar",
                      ][index]
                    }
                    size={25}
                  />
                  <span>0{index + 1}</span>
                </div>
                <h2>{offering.title}</h2>
                <p>{offering.description}</p>
                <ul
                  aria-label={`Possible scope for ${offering.title.toLowerCase()}`}
                >
                  {offering.scope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="service-fit">{offering.fit}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section
        className="bg-white py-20 sm:py-28"
        aria-labelledby="scope-heading"
      >
        <div className="studio-container grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2
              id="scope-heading"
              className="max-w-lg text-balance text-3xl leading-tight font-medium tracking-[-0.03em] sm:text-5xl"
            >
              Agree the details before the build.
            </h2>
            <Link href="/process" className="text-link mt-7 inline-flex">
              See how the process works
            </Link>
          </div>
          <div className="page-copy space-y-5">
            <p>
              The right scope depends on your content, the number of pages, and
              the tools your business uses. We discuss those needs before
              recommending an approach.
            </p>
            <p>
              Your proposal should make the deliverables, price, review stages,
              and estimated schedule clear. Hosting, ongoing support, ownership,
              and any third-party costs are part of that conversation too.
            </p>
            <p>
              Have a website already? Bring the link. Starting fresh? Tell us
              about the business and we can work through what you need.
            </p>
          </div>
        </div>
      </section>
      <section
        className="studio-container section-space"
        aria-labelledby="services-next-step"
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <h2
              id="services-next-step"
              className="max-w-2xl text-balance text-3xl font-medium tracking-[-0.03em] sm:text-5xl"
            >
              A good place to start is a conversation.
            </h2>
            <p className="page-copy mt-5 max-w-xl">
              Tell us what is working, what is missing, and what you would like
              to improve.
            </p>
          </div>
          <Link href="/book" className="button-primary shrink-0">
            Discuss your website
          </Link>
        </div>
      </section>
    </>
  );
}
