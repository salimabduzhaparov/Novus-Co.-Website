import Link from "next/link";
import { ScrollStory } from "@/components/ScrollStory";
import CustomerEvidence from "@/components/CustomerEvidence";
import { GrowthStory } from "@/components/GrowthStory";
import { StudioFAQ } from "@/components/StudioFAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { StudioTimeline } from "@/components/ui/StudioTimeline";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const services = [
  {
    title: "A website that explains your business",
    description:
      "Your services, service area and real work, presented clearly on every screen.",
    href: "/services#business-websites",
    icon: "layers",
  },
  {
    title: "A clearer route to an enquiry",
    description:
      "Visible contact details, quote forms and booking options built around how you work.",
    href: "/services#enquiry-systems",
    icon: "phone",
  },
  {
    title: "A stronger foundation for search",
    description:
      "Useful service pages, descriptive titles and technical SEO essentials that help search engines understand your business.",
    href: "/services#seo-foundations",
    icon: "target",
  },
];
export default function Home() {
  return (
    <>
      <ScrollStory evidence={<CustomerEvidence story />} />
      <section
        className="section-space home-services"
        aria-labelledby="home-services"
      >
        <div className="studio-container">
          <div className="section-intro">
            <span className="eyebrow">Our services</span>
            <div>
              <h2 id="home-services">
                Turn unanswered questions
                <br />
                into clear next steps.
              </h2>
              <p className="page-copy mt-6 max-w-xl">
                Starting without a website or fixing one that falls short? We
                build around the decisions your customers need to make.
              </p>
            </div>
          </div>
          <div className="solution-grid">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <Link href={s.href} className="solution-card">
                  <div className="solution-card-top">
                    <Icon name={s.icon} size={25} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <span className="solution-link">
                    Explore the service <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-9">
            <TextLink href="/services">All website services</TextLink>
          </div>
        </div>
      </section>
      <section className="why-novus section-space" aria-labelledby="home-about">
        <div className="studio-container why-layout">
          <div>
            <span className="eyebrow">Why Novus</span>
            <h2 id="home-about">
              Built around your business.
              <br />
              <em>Clear from the start.</em>
            </h2>
            <p>
              Local businesses put care into their work. We believe their
              websites should show that same care—and help customers understand
              it.
            </p>
            <TextLink href="/about">The thinking behind Novus</TextLink>
          </div>
          <div className="why-principles">
            {[
              [
                "See a direction first",
                "A free website preview helps you see the possibilities before committing to a full project.",
              ],
              [
                "Made for local services",
                "We focus on the details that matter to your customers: the work, the area you serve and how to reach you.",
              ],
              [
                "Know what happens next",
                "A shared direction, an agreed scope and a process with space for your feedback.",
              ],
            ].map(([title, copy], i) => (
              <Reveal key={title} delay={i * 0.07}>
                <article>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <GrowthStory />
      <section
        className="section-space studio-container"
        aria-labelledby="home-process"
      >
        <div className="section-intro">
          <span className="eyebrow">Our process</span>
          <div>
            <h2 id="home-process">
              A preview first.
              <br />A clear path to launch.
            </h2>
            <p className="page-copy mt-6 max-w-xl">
              Six stages, with your input at the right moments. See the
              direction before we build the full website.
            </p>
          </div>
        </div>
        <StudioTimeline />
        <div className="mt-9">
          <TextLink href="/process">Explore the full process</TextLink>
        </div>
      </section>
      <StudioFAQ />
      <FinalCTA title="You take pride in your work. Your website should show it." />
    </>
  );
}
