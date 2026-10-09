import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { BookingForm } from "@/components/BookingForm";
import { CONTACT_EMAIL } from "@/lib/content";
import styles from "./book-page.module.css";

export const metadata: Metadata = {
  title: "Request a Free Website Preview",
  description:
    "Tell Novus about your business and request a free website preview. We’ll arrange a time with you by email.",
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
    text: "A custom website direction to review, with no commitment to a full build.",
  },
];

export default function BookPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 id="preview-title">See what your website could be.</h1>
        <p>
          Tell us about your business. We’ll email you to arrange a free
          10-minute preview call.
        </p>
      </header>

      <section
        id="preview-request"
        className={styles.request}
        aria-labelledby="preview-title"
      >
        <BookingForm />
      </section>

      <section className={styles.expectations} aria-labelledby="what-to-expect">
        <h2 id="what-to-expect">What happens next</h2>
        <ul>
          {whatToExpect.map((item) => (
            <li key={item.text}>
              <span className={styles.expectationIcon} aria-hidden="true">
                <Icon name={item.icon} size={20} />
              </span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
        <div className={styles.directContact}>
          <p>Prefer to write to us directly?</p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </section>
    </div>
  );
}
