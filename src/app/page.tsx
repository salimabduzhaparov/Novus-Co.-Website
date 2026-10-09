import Link from "next/link";
import { Hero } from "@/components/Hero";
import { WebsiteExamples } from "@/components/WebsiteExamples";
import { StudioFAQ } from "@/components/StudioFAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { TextLink } from "@/components/ui/Button";
const services = [
  {
    title: "Websites with purpose",
    description:
      "A considered home for your business. Clear services, distinctive design, and a customer journey that makes sense.",
    href: "/services#business-websites",
  },
  {
    title: "A fresh perspective",
    description:
      "A redesign that brings your existing website up to the standard of the work you do today.",
    href: "/services#website-redesigns",
  },
  {
    title: "The right foundations",
    description:
      "Search-friendly structure, responsive development, and straightforward forms or booking connections.",
    href: "/services#seo-foundations",
  },
];
export default function Home() {
  return (
    <>
      <Hero />
      <WebsiteExamples />
      <section
        className="section-space studio-container"
        aria-labelledby="home-services"
      >
        <div className="section-intro">
          <span className="eyebrow">What we bring</span>
          <div>
            <h2 id="home-services">
              Good design.
              <br />A clear reason for it.
            </h2>
            <p className="page-copy mt-6 max-w-xl">
              From a first website to a fresh start, we turn what makes your
              business different into an experience people understand.
            </p>
          </div>
        </div>
        <div>
          {services.map((s, i) => (
            <Link href={s.href} key={s.title} className="service-row">
              <span className="service-number">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <span className="service-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="about-band section-space"
        aria-labelledby="home-about"
      >
        <div className="studio-container about-inner">
          <span className="eyebrow">The thinking behind Novus</span>
          <div>
            <h2 id="home-about" className="section-title">
              You take pride in your work.
              <br />
              Your website should show it.
            </h2>
            <p className="page-copy">
              Local businesses bring care, skill, and personality to what they
              do. We believe their websites should do the same. Novus combines
              thoughtful design with practical decisions, making it easier for
              the right customers to see what you offer.
            </p>
            <TextLink href="/about">Get to know Novus</TextLink>
          </div>
        </div>
      </section>
      <section
        className="section-space studio-container"
        aria-labelledby="home-process"
      >
        <div className="section-intro">
          <span className="eyebrow">From first conversation to launch</span>
          <div>
            <h2 id="home-process">
              A shared direction.
              <br />A clear path forward.
            </h2>
            <p className="page-copy mt-6 max-w-xl">
              We listen first, shape the direction together, then build and test
              the details. You know what is happening and what comes next.
            </p>
            <div className="mt-6">
              <TextLink href="/process">Explore the process</TextLink>
            </div>
          </div>
        </div>
        <ol className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Understand",
              copy: "Your business, your customers, and what the website needs to do.",
            },
            {
              title: "Design together",
              copy: "A clear visual direction, with room for your input before the build.",
            },
            {
              title: "Build & launch",
              copy: "Bring it to life, check the essentials, and prepare for the next chapter.",
            },
          ].map((s, i) => (
            <li key={s.title} className="border-t border-hairline pt-6">
              <span className="eyebrow text-accent">0{i + 1}</span>
              <h3 className="mt-8 text-2xl font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-silver">
                {s.copy}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <StudioFAQ />
      <FinalCTA />
    </>
  );
}
