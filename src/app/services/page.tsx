import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "./services-page.module.css";

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
    icon: "layers",
    outcome: "Give customers a clear picture of your business.",
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
    icon: "refresh",
    outcome: "Make your website reflect the quality of your work.",
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
    icon: "target",
    outcome: "Give one service or offer a focused destination.",
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
    icon: "chart",
    outcome: "Help search engines understand what you offer.",
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
    icon: "mail",
    outcome: "Make it easier to take the next enquiry.",
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
    icon: "calendar",
    outcome: "Give customers a convenient way to book.",
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
    <div className={styles.page}>
      <section className={`studio-container ${styles.hero}`} aria-labelledby="services-title">
        <p className={styles.sectionLabel}>Our services</p>
        <div className={styles.heroGrid}>
          <h1 id="services-title">Built for the next call, quote or booking.</h1>
          <div className={styles.heroCopy}>
            <p>
              A clear website helps customers understand your work and know how
              to reach you. We design the pages and connect the tools that make
              those next steps easier.
            </p>
            <Link href="/book" className={`button-primary ${styles.primaryLink}`}>
              Request a free preview
            </Link>
          </div>
        </div>
      </section>
      <section
        className={`studio-container ${styles.services}`}
        aria-label="Website services"
      >
        <div className={styles.directoryHeading}>
          <p className={styles.sectionLabel}>Find the right service</p>
          <p>Start fresh, improve what you have, or add a useful new tool.</p>
        </div>
        <nav className={styles.serviceNav} aria-label="Jump to a service">
          {offerings.map((offering) => (
            <a key={offering.id} href={`#${offering.id}`}>
              <Icon name={offering.icon} size={19} />
              <span>{offering.title}</span>
            </a>
          ))}
        </nav>
        <div className={styles.serviceGrid}>
          {offerings.map((offering) => (
            <article
              key={offering.id}
              id={offering.id}
              className={styles.service}
              aria-labelledby={`${offering.id}-title`}
            >
              <div className={styles.serviceContent}>
                <div className={styles.serviceHeading}>
                  <span className={styles.serviceIcon}>
                    <Icon name={offering.icon} size={24} />
                  </span>
                  <h2 id={`${offering.id}-title`}>{offering.title}</h2>
                </div>
                <p className={styles.outcome}>{offering.outcome}</p>
                <p className={styles.description}>{offering.description}</p>
              </div>
              <div className={styles.scope}>
                <h3>What we can help with</h3>
                <ul
                  aria-label={`Possible scope for ${offering.title.toLowerCase()}`}
                >
                  {offering.scope.map((item) => (
                    <li key={item}>
                      <Icon name="check" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.fit}>{offering.fit}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
        className={styles.scopeSection}
        aria-labelledby="scope-heading"
      >
        <div className={`studio-container ${styles.scopeGrid}`}>
          <div>
            <p className={styles.sectionLabel}>Your scope, made clear</p>
            <h2 id="scope-heading">
              Agree the details before the build.
            </h2>
            <Link href="/process" className={styles.processLink}>
              See how the process works
              <Icon name="arrow" size={20} />
            </Link>
          </div>
          <div className={styles.scopeCopy}>
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
        className={`studio-container ${styles.nextStep}`}
        aria-labelledby="services-next-step"
      >
        <div className={styles.nextStepPanel}>
          <div>
            <p className={styles.sectionLabel}>Start with a free preview</p>
            <h2 id="services-next-step">
              See a direction for your business.
            </h2>
            <p className={styles.nextStepCopy}>
              Tell us about your work and what customers need to find. We can
              explore a website direction before you commit to a full build.
            </p>
          </div>
          <Link href="/book" className={`button-primary ${styles.previewLink}`}>
            Request a free preview
          </Link>
        </div>
      </section>
    </div>
  );
}
