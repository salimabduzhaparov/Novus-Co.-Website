import { SectionHeading } from "./ui/SectionHeading";
import { IndustryCard } from "./ui/IndustryCard";
import { industries } from "@/lib/content";

export function Industries() {
  return (
    <section className="px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <SectionHeading kicker="Industries" title="Built for home-service businesses." />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((ind, i) => (
            <IndustryCard key={ind.name} name={ind.name} icon={ind.icon} desc={ind.desc} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
