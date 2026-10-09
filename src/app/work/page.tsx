import type { Metadata } from "next";
import { WebsiteExamples } from "@/components/WebsiteExamples";
import { PrimaryButton } from "@/components/ui/Button";
import styles from "@/components/website-examples.module.css";

export const metadata: Metadata = {
  title: "Website Design Explorations | Bluepeak & Mike the Plumber",
  description:
    "Explore Novus website concepts for Bluepeak Plumbing & Electrical and Mike the Plumber. Distinctive trade-business design, purposeful motion and clear customer journeys.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className={`studio-container ${styles.workHero}`}>
        <p className={styles.sectionLabel}>Website explorations</p>
        <h1>
          Good work deserves
          <br />a better first impression.
        </h1>
        <div className={styles.workIntroduction}>
          <p>
            A business has its own character. Its website should make that
            visible. Explore two different directions for local trade
            businesses.
          </p>
          <p>
            These hero explorations show our approach to identity, layout and
            motion. They are design concepts, rather than claims of client
            approval or measured business outcomes.
          </p>
        </div>
        <div className="mt-8">
          <PrimaryButton>Request a free preview</PrimaryButton>
        </div>
      </section>
      <WebsiteExamples full />
      <section className={`studio-container ${styles.workCta}`}>
        <div>
          <h2>What should yours feel like?</h2>
          <p>Tell us about the business behind the website.</p>
        </div>
        <PrimaryButton className="shrink-0">
          Request a free preview
        </PrimaryButton>
      </section>
    </>
  );
}
