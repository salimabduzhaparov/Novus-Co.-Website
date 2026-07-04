import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBox } from "@/components/ui/CtaBox";
import { ContactForm } from "@/components/ContactForm";
import { CONTACT_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — Novus Co.",
  description: "Get in touch with Novus Co.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Let's talk about your website."
        subtitle="Questions, project ideas, or just want to say hello — send a message below and we'll reply within one business day."
      />

      <section className="px-6 pb-20 sm:px-10 sm:pb-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-2xl">
          <Reveal delay={0.1}>
            <CtaBox
              title="Ready to start a project?"
              desc="A 10-minute preview call is the fastest way to see what your business could look like online."
              ctaLabel="Start a Website Preview"
              ctaHref="/book"
            />
            <p className="mt-6 text-center text-xs text-silver-dim">
              Prefer email?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-light hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
