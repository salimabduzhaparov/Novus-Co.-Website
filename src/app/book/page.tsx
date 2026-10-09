import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { BookingForm } from "@/components/BookingForm";
import { CONTACT_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Request a Website Consultation",
  description:
    "Tell Novus about your business and request a free 10-minute website consultation. We’ll arrange a time with you by email.",
  alternates: { canonical: "/book" },
};

const whatToExpect = [
  {
    icon: "phone",
    text: "A short conversation about your business, your customers, and your website.",
  },
  {
    icon: "target",
    text: "A chance to talk through what you need and ask your questions.",
  },
  {
    icon: "layers",
    text: "A clear next step, whether you need a new website or a redesign.",
  },
];

export default function BookPage() {
  return (
    <>
      <PageHero
        kicker="Start a conversation"
        title="A better website starts here."
        subtitle="Tell us a little about your business. We’ll email you to arrange a free 10-minute call."
      />
      <section className="px-6 pb-24 sm:px-10 sm:pb-32">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="py-3">
              <h2 className="mb-7 text-2xl font-medium tracking-tight">
                Let’s see what’s possible.
              </h2>
              <ul className="space-y-6">
                {whatToExpect.map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent"
                      aria-hidden="true"
                    >
                      <Icon name={item.icon} size={18} />
                    </span>
                    <span className="pt-1 text-base leading-relaxed text-silver">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 border-t border-hairline pt-7">
                <p className="mb-2 text-base text-silver">
                  Prefer to write to us directly?
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all text-base font-medium text-accent underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <BookingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
