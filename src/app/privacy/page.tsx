import type { Metadata } from "next";
import Link from "next/link";
import { outreachPrivacy } from "@/lib/outreach-privacy";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT_EMAIL } from "@/lib/content";
export const metadata: Metadata = {
  title: "Privacy",
  description: "How Novus handles website enquiries and Google account data used by its private outreach automation.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <>
      <PageHero
        kicker="Your information"
        title="Privacy, in plain language."
        subtitle="How website enquiries and our private automation handle information."
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
          <div id="outreach-automation" className="space-y-5 scroll-mt-24">
            <h2 className="text-2xl font-medium text-ink mb-3">
              Novus Outreach Automation and Google account data
            </h2>
            <p>Updated 10 October 2026.</p>
            {outreachPrivacy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p>
              <a className="underline underline-offset-4" href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>
              {" · "}
              <a className="underline underline-offset-4" href="https://myaccount.google.com/connections">Manage Google account connections</a>
            </p>
            <p>
              <Link className="underline underline-offset-4" href="/outreach-automation">About Novus Outreach Automation</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
