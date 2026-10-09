import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "About Our Website Design Studio",
  description:
    "The thinking behind Novus: thoughtful website design, clear communication, and a practical approach to helping local service businesses show their work.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Start with the business.",
    detail:
      "The services you offer, the people you serve, and the questions you hear every day give a website its direction. Understanding those things comes before choosing a layout.",
  },
  {
    title: "Make every part useful.",
    detail:
      "A photograph can show the quality of your work. A well-written service page can answer a customer's question. A clear contact form can make the next step easier. Each element should have a reason to be there.",
  },
  {
    title: "Keep the process clear.",
    detail:
      "You should understand what is being proposed, have space to give feedback, and know what happens next. We discuss the scope and practical details before the build begins.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About Novus"
        title="Good work deserves to be seen."
        subtitle="We help local service businesses bring the care they put into their work to the way they appear online."
      />
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-labelledby="why-novus"
      >
        <div className="grid gap-8 border-t border-ink/15 pt-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:pt-14">
          <h2
            id="why-novus"
            className="text-xl font-medium tracking-tight sm:text-2xl"
          >
            Why we exist
          </h2>
          <div className="max-w-3xl">
            <p className="text-balance text-2xl leading-[1.35] font-medium tracking-[-0.025em] sm:text-4xl">
              Your website should make the quality of your business easy to
              understand.
            </p>
            <div className="page-copy mt-7 space-y-5">
              <p>
                You can take real pride in your work and still have a website
                that struggles to explain it. Services are hard to find, the
                best projects are missing, or getting in touch takes more effort
                than it should.
              </p>
              <p>
                Novus exists to help close that gap. We bring together design,
                content, and the practical details of a working website, so a
                visitor can understand what you do and decide whether you are
                right for the job.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        className="bg-[#2459e0] py-20 text-white sm:py-28"
        aria-labelledby="our-purpose"
      >
        <div className="studio-container grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <h2
            id="our-purpose"
            className="text-xl font-medium tracking-tight sm:text-2xl"
          >
            Our purpose
          </h2>
          <div className="max-w-3xl">
            <p className="text-balance text-3xl leading-[1.15] font-medium tracking-[-0.035em] sm:text-5xl lg:text-[3.6rem]">
              Make thoughtful design part of everyday business.
            </p>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/90">
              A local business deserves a considered online presence. Our aim is
              to make the process approachable, the decisions understandable,
              and the finished website relevant to the people using it.
            </p>
          </div>
        </div>
      </section>
      <section
        className="studio-container section-space"
        aria-labelledby="our-approach"
      >
        <div className="section-intro">
          <h2 id="our-approach">A practical kind of care.</h2>
          <p className="page-copy">
            The way we approach a project matters as much as the way it looks.
          </p>
        </div>
        <div className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="border-t border-ink/15 pt-7"
            >
              <h3 className="text-2xl font-medium tracking-[-0.025em]">
                {principle.title}
              </h3>
              <p className="mt-4 text-base leading-[1.75] text-silver">
                {principle.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="studio-container pb-20 sm:pb-28"
        aria-labelledby="who-we-design-for"
      >
        <div className="grid gap-10 border-t border-ink/15 pt-12 lg:grid-cols-2 lg:gap-20">
          <h2
            id="who-we-design-for"
            className="max-w-lg text-balance text-3xl leading-tight font-medium tracking-[-0.03em] sm:text-4xl"
          >
            Built around people who do real work.
          </h2>
          <div className="page-copy space-y-5">
            <p>
              Our focus is local service businesses: trades, home services,
              appointment-based businesses, and other independent businesses
              whose customers need clear information before they get in touch.
            </p>
            <p>
              That might mean showing a finished landscaping project, explaining
              a repair service, or making it easier to request an appointment.
              The right website starts with what your customers need to know.
            </p>
            <Link href="/services" className="text-link mt-3 inline-flex">
              Explore our services
            </Link>
          </div>
        </div>
      </section>
      <section
        className="studio-container pb-24 sm:pb-32"
        aria-labelledby="about-next-step"
      >
        <div className="flex flex-col items-start justify-between gap-8 rounded-[1.75rem] bg-white p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2
              id="about-next-step"
              className="text-balance text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            >
              Tell us what you are building.
            </h2>
            <p className="page-copy mt-4">
              We can start with where your business is today, and what you want
              your website to do next.
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
