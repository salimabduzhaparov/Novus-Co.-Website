import type { Metadata } from "next";
import Link from "next/link";
import { WebsiteExamples } from "@/components/WebsiteExamples";
import styles from "@/components/website-examples.module.css";

export const metadata: Metadata = {
  title: "Website Design Concepts",
  description:
    "Explore original Novus website design concepts for landscaping and home renovation businesses. A look at our approach to clear, distinctive local-business websites.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className={`studio-container ${styles.workHero}`}>
        <p className={styles.sectionLabel}>Design explorations</p>
        <h1>
          A website should feel
          <br />
          like it belongs to you.
        </h1>
        <div className={styles.workIntroduction}>
          <p>
            Two businesses. Two distinct directions. A closer look at how
            thoughtful design can express the character of a local business.
          </p>
          <p>
            These are original studies for fictional brands, created to
            illustrate our design approach. They are not client projects or
            claims of business results.
          </p>
        </div>
      </section>
      <WebsiteExamples full />
      <section className={`studio-container ${styles.workCta}`}>
        <div>
          <h2>Let’s find your direction.</h2>
          <p>
            Tell us about your business and what you want your website to do.
          </p>
        </div>
        <Link href="/book" className="button-primary">
          Discuss your website <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
