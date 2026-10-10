import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT_EMAIL } from "@/lib/content";
import { outreachDescription } from "@/lib/outreach-privacy";

export const metadata: Metadata = {
  title: "Novus Outreach Automation",
  description: "Novus Co.'s private Gmail and Google Sheets correspondence tool, its purpose and privacy information.",
  alternates: { canonical: "/outreach-automation" },
};

export default function OutreachAutomation() {
  return (
    <>
      <PageHero kicker="Private Novus tool" title="Novus Outreach Automation" subtitle="Correspondence and contact records, managed by Novus Co." />
      <section className="studio-container pb-24">
        <div className="max-w-3xl space-y-9 page-copy">
          {outreachDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p><Link className="underline underline-offset-4" href="/privacy#outreach-automation">Read our privacy information</Link></p>
          <p>Questions: <a className="underline underline-offset-4 break-all" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        </div>
      </section>
    </>
  );
}
