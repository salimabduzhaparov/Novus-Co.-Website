import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PrimaryButton } from "@/components/ui/Button";
export const metadata: Metadata = {
  title: "What Makes a Useful Business Website",
  description:
    "The practical foundations of a clear, accessible business website.",
  alternates: { canonical: "/statistics" },
};
const items = [
  {
    title: "Make the offer clear.",
    copy: "Explain what you do, who you help, and where you work. Use the same language customers use when they ask about your services.",
  },
  {
    title: "Make the work visible.",
    copy: "Use relevant photographs, clearly described projects, and customer feedback you have permission to publish. Give visitors useful evidence to form their own impression.",
  },
  {
    title: "Make the next step simple.",
    copy: "Put contact options where people expect to find them. Keep forms focused, label fields properly, and explain what happens after an enquiry.",
  },
  {
    title: "Build solid search foundations.",
    copy: "Give every page a purpose, use descriptive titles and headings, link related information, and make the site accessible to search engines.",
  },
];
export default function WebsiteEssentials() {
  return (
    <>
      <PageHero
        kicker="Website essentials"
        title="Useful comes before impressive."
        subtitle="A few practical principles behind a website that represents your business clearly."
      />
      <section className="studio-container pb-24">
        <div className="max-w-4xl">
          {items.map((s) => (
            <article key={s.title} className="border-t border-hairline py-9">
              <h2 className="text-3xl font-medium tracking-tight">{s.title}</h2>
              <p className="page-copy mt-4">{s.copy}</p>
            </article>
          ))}
          <div className="mt-10">
            <PrimaryButton>Discuss your website</PrimaryButton>
          </div>
        </div>
      </section>
    </>
  );
}
