import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { TextLink } from "./ui/Button";
import { ProcessTimeline } from "./ui/ProcessTimeline";
import { processSteps } from "@/lib/content";

export function Process() {
  return (
    <section id="process" className="px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-3xl">
        <SectionHeading kicker="Process" title="From first call to launch." />

        <div className="mt-16">
          <ProcessTimeline
            steps={processSteps.map((s) => ({ title: s.title, detail: s.short }))}
          />
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12">
            <TextLink href="/process">Explore the process in detail</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
