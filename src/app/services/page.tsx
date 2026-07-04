import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBox } from "@/components/ui/CtaBox";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services — Novus Co.",
  description:
    "Websites, SEO setup, lead systems, and booking tools built for home-service businesses.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services"
        title="Built for home-service businesses."
        subtitle="Every service is built around one outcome — a business that looks more professional, earns trust faster, and turns visitors into booked jobs."
      />

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 0.08}>
                <ServiceCard service={s} index={i} />
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <CtaBox />
          </div>
        </div>
      </section>
    </>
  );
}
