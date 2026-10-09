import Link from "next/link";
import styles from "./website-examples.module.css";

const questions = [
  {
    question: "How does the free preview work?",
    answer:
      "Tell us about your business and what you need from a website. We’ll contact you to arrange a short conversation, then develop a design direction for you to review. The preview is a starting point, with no commitment to a full build. Any paid work, scope and schedule are agreed separately.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
      "Yes. We can look at your current website, discuss what is working and identify what needs to change. Share the link when you get in touch so the conversation starts with your business.",
  },
  {
    question: "How much will my website cost?",
    answer:
      "The cost depends on the pages, content and features your business needs. We discuss the scope with you and provide a proposal before paid work begins, so you can make a decision with the details in front of you.",
  },
  {
    question: "How long does a project take?",
    answer:
      "The schedule depends on the scope and on when your content and feedback are available. We agree on a project timeline with you before starting. If you have a launch date in mind, let us know in your enquiry.",
  },
  {
    question: "Do I need to have all my content ready?",
    answer:
      "You do not need everything ready for the first conversation. Your services, business details, existing branding and any suitable photographs are a useful starting point. We can discuss where you need help with the rest.",
  },
  {
    question: "What about SEO, hosting and ongoing support?",
    answer:
      "We discuss search visibility, hosting and support as part of the project scope. Your proposal should make clear what is included at launch, who manages the domain and website, and what any ongoing work involves. Search rankings are not guaranteed.",
  },
  {
    question: "Are the websites shown here client projects?",
    answer:
      "The Bluepeak and Mike the Plumber showcases are website design explorations. They show how a service business can present its work and help customers get in touch; they are not claims about client results.",
  },
];

export function StudioFAQ() {
  return (
    <section
      className={`section-space ${styles.faqSection}`}
      aria-labelledby="studio-faq-title"
    >
      <div className={`studio-container ${styles.faqLayout}`}>
        <div className={styles.faqIntro}>
          <p className={styles.sectionLabel}>Before we begin</p>
          <h2 id="studio-faq-title">
            A few things
            <br />
            you might be wondering.
          </h2>
          <p>
            Have something else in mind?
            <br />
            We’re happy to talk it through.
          </p>
          <Link href="/contact" className={styles.textLink}>
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className={styles.faqList}>
          {questions.map(({ question, answer }) => (
            <details key={question} name="novus-faq" className={styles.faqItem}>
              <summary>
                {question}
                <span className={styles.faqIcon} aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
