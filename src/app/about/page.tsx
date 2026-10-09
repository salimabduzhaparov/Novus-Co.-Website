import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
export const metadata: Metadata = {
  title: "About Our Local Business Website Studio",
  description:
    "Why Novus exists: helping local service businesses show the quality of their work online, with a free preview, clear website design and a practical process.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Why Novus"
        title="Good at your trade. Seen for your work."
        subtitle="Local service businesses put care into what they do. Novus exists to bring that same care to how they appear online."
      />
      <section
        className="studio-container pb-20"
        aria-label="Our mission and vision"
      >
        <div className="mission-grid">
          <Reveal>
            <article className="mission-card">
              <span className="eyebrow">Our mission</span>
              <h2>
                Make your business easier to understand—and easier to choose.
              </h2>
              <p>
                Build clear, professional websites that explain your services,
                show your work and give potential customers a straightforward
                way to get in touch.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="mission-card">
              <span className="eyebrow">Our vision</span>
              <h2>Better websites within reach of local businesses.</h2>
              <p>
                Become a digital partner for service businesses that want to
                improve their online presence through good design, useful tools
                and a process they understand.
              </p>
            </article>
          </Reveal>
        </div>
        <div className="about-story">
          <Reveal>
            <span className="eyebrow mb-5">The thinking behind Novus</span>
            <h2>
              Your reputation deserves
              <br />a website that reflects it.
            </h2>
            <p>
              A customer may hear about you from a neighbour, find you in a
              search or come across a review. Their next question is simple: can
              this business help me?
            </p>
            <p>
              When your services are hard to find, your best work is missing or
              there is no website to explore, that question can go unanswered.
              The quality of your work deserves a better introduction.
            </p>
            <p>
              We focus on local service businesses—plumbers, electricians,
              roofers, home services and independent businesses. The goal is
              practical: explain what you offer, show relevant work and make the
              next step clear.
            </p>
            <p>
              We start with a conversation and a free website preview. You see a
              direction, give feedback and understand the scope before deciding
              on a full build. Clear communication is part of the service.
            </p>
            <div className="mt-8">
              <TextLink href="/process">See how the process works</TextLink>
            </div>
          </Reveal>
        </div>
        <div className="solution-grid">
          {[
            [
              "Understand the business",
              "Your services, customers and day-to-day questions guide the design. We start with what the website needs to explain.",
            ],
            [
              "Make every detail useful",
              "A service page answers a question. A project photo shows the work. A clear contact option helps someone take the next step.",
            ],
            [
              "Keep the decisions clear",
              "You can review the direction, ask questions and know what is included. Further work is discussed and agreed separately.",
            ],
          ].map(([title, copy], i) => (
            <Reveal key={title} delay={i * 0.07}>
              <article className="solution-card">
                <span className="eyebrow text-accent">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
