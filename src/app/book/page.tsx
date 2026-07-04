import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { BookingForm } from "@/components/BookingForm";
import { CONTACT_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Preview Call — Novus Co.",
  description: "Book a free 10-minute preview call with Novus Co.",
};

const whatToExpect = [
  { icon: "phone", text: "A relaxed 10-minute call — no pressure, no sales script." },
  { icon: "target", text: "We learn about your business and what's not working online." },
  { icon: "layers", text: "You'll get a clear next step, whether that's a preview or just advice." },
];

export default function BookPage() {
  return (
    <>
      <PageHero
        kicker="Book a Call"
        title="Book a 10-minute preview call."
        subtitle="Tell us about your business below — we'll confirm a time that works by email or phone."
      />

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-silver-dim">
                  What to expect
                </h2>
                <ul className="space-y-5">
                  {whatToExpect.map((item) => (
                    <li key={item.text} className="flex items-start gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-light/30 text-accent-light">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="text-sm leading-relaxed text-silver">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 text-sm text-silver">
                Prefer email instead?{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-light hover:underline">
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
