import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { CONTACT_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a website project in mind? Contact Novus to discuss your business, a new website, or a redesign.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Let’s make something worthwhile."
        subtitle="A new website, a fresh direction, or a question. Tell us what you have in mind."
      />
      <section className="px-6 pb-24 sm:px-10 sm:pb-32">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="py-3">
              <h2 className="mb-4 text-2xl font-medium tracking-tight">
                Good work starts with a conversation.
              </h2>
              <p className="mb-8 text-base leading-relaxed text-silver">
                Share a little about your business and what you need from your
                website. We’ll get back to you by email.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="break-all text-base font-medium text-accent underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              <div className="mt-10 border-t border-hairline pt-7">
                <p className="mb-3 text-base text-silver">
                  Want to see a website direction first?
                </p>
                <PrimaryButton>Request a free preview</PrimaryButton>
                <p className="mt-4 text-sm leading-relaxed text-silver">
                  We’ll arrange a short call by email. No payment or commitment
                  to a full build.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
