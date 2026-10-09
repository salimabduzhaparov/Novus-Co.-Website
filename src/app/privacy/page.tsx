import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT_EMAIL } from "@/lib/content";
export const metadata: Metadata = {
  title: "Privacy",
  description: "How Novus handles information submitted through this website.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <>
      <PageHero
        kicker="Your information"
        title="Privacy, in plain language."
        subtitle="How information submitted through this website is used."
      />
      <section className="studio-container pb-24">
        <div className="max-w-3xl space-y-9 page-copy">
          <div>
            <h2 className="text-2xl font-medium text-ink mb-3">
              Information you choose to share
            </h2>
            <p>
              Our enquiry forms collect your name, email address, business
              details where requested, and the message or optional contact
              information you provide. We use this information to respond to
              your enquiry and discuss a possible project.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-ink mb-3">
              How your enquiry reaches us
            </h2>
            <p>
              The website is hosted on Vercel. Form submissions are sent to
              Novus by email through Resend. Those providers process the
              technical information needed to host the site and deliver your
              message. Please avoid sending sensitive personal information
              through these forms.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-ink mb-3">
              Questions about your information
            </h2>
            <p>
              To ask about information you have submitted, or request correction
              or deletion, email{" "}
              <a
                className="underline underline-offset-4 break-all"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
