import type { Metadata } from "next";
import { PrimaryButton } from "@/components/ui/Button";
import { novusProcessSteps } from "@/lib/process";
import styles from "./process-page.module.css";

export const metadata: Metadata = {
  title: "Our Website Design Process",
  description:
    "See how Novus takes your local business from a free website preview to launch: discovery, design, review, build, handover, and optional improvements.",
  alternates: { canonical: "/process" },
};

const stageDetails = [
  {
    id: "discover",
    focus: "Start with the business, then the website.",
    work: [
      "Map your main services, service area, and ideal customer.",
      "Identify the questions people ask before they call you.",
      "Choose the action the website should make easier: a call, quote, or booking.",
    ],
    input:
      "Tell us how your business works. Share your existing site, social profile, or any examples you like.",
  },
  {
    id: "preview",
    focus: "See a direction before committing to the build.",
    work: [
      "Set a visual direction using your brand and the work you do.",
      "Shape the page layout around the information customers need.",
      "Show how a visitor could move from finding you to getting in touch.",
    ],
    input:
      "Share an existing logo and a few useful photos if you have them. We will flag any content that still needs to be supplied.",
  },
  {
    id: "review",
    focus: "Make the important decisions together.",
    work: [
      "Walk through the preview and discuss what fits your business.",
      "Review the wording, page structure, and calls to action.",
      "Agree the scope, price, responsibilities, and schedule before paid work begins.",
    ],
    input:
      "Give clear feedback and confirm the business details. This is the time to ask questions and settle what is included.",
  },
  {
    id: "build",
    focus: "Turn the agreed direction into a working site.",
    work: [
      "Build responsive pages that work across desktop and mobile.",
      "Add the agreed contact forms, call links, or booking connections.",
      "Check navigation, content, search metadata, and key customer journeys.",
    ],
    input:
      "Approve the final content and test the preview with us. We check that enquiries reach the intended destination before launch.",
  },
  {
    id: "launch",
    focus: "Go live with the details taken care of.",
    work: [
      "Publish to the agreed domain once you approve the site.",
      "Check the live pages, links, contact routes, and mobile experience.",
      "Explain access, hosting, and how future changes will be handled.",
    ],
    input:
      "Give final approval and provide any domain access needed. We agree who owns each account and what happens after handover.",
  },
  {
    id: "improve",
    focus: "Keep the website useful as your business grows.",
    work: [
      "Refresh service information, opening hours, or project photography.",
      "Discuss new pages or tools when there is a clear business need.",
      "Use available enquiry and website data to guide future priorities.",
    ],
    input:
      "Tell us what has changed. Ongoing support and additional work are optional and scoped separately.",
  },
];

export default function ProcessPage() {
  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-labelledby="process-title">
        <div className="studio-container">
          <p className={styles.label}>Our process</p>
          <h1 id="process-title">
            A clear path from first conversation to launch.
          </h1>
          <p className={styles.introCopy}>
            You should know what happens next, what we need from you, and what
            each stage delivers. Here is how we build your website together.
          </p>
          <div className={styles.heroActions}>
            <PrimaryButton tone="light">Request a free preview</PrimaryButton>
            <a href="#process-stages" className={styles.stageLink}>
              Explore the six stages <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="process-stages" className={styles.stages}>
        <div className={`studio-container ${styles.sectionHeading}`}>
          <h2 id="process-stages">Your project, step by step.</h2>
          <p>A preview first. A shared direction. A considered build.</p>
        </div>
        <ol className={styles.stageList}>
          {novusProcessSteps.map((step, index) => {
            const detail = stageDetails[index];
            return (
              <li key={detail.id} className={styles.stage} id={detail.id}>
                <div className={`studio-container ${styles.stageGrid}`}>
                  <span className={styles.number} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.stageOverview}>
                    <h3>{step.title}</h3>
                    <p className={styles.focus}>{detail.focus}</p>
                    <p className={styles.description}>{step.description}</p>
                    <div className={styles.outcome}>
                      <span>What you leave with</span>
                      <p>{step.takeaway}</p>
                    </div>
                  </div>
                  <div className={styles.stageDetail}>
                    <h4>What happens here</h4>
                    <ul>
                      {detail.work.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className={styles.yourPart}>
                      <h4>Your part</h4>
                      <p>{detail.input}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.prepare} aria-labelledby="prepare-heading">
        <div className={`studio-container ${styles.prepareGrid}`}>
          <div>
            <p className={styles.label}>Getting started</p>
            <h2 id="prepare-heading">You can start with what you have.</h2>
          </div>
          <div className={styles.prepareCopy}>
            <p>
              An existing website, a few photographs, or a clear idea of your
              services is a useful starting point. You do not need to arrive
              with every word and image ready.
            </p>
            <p>
              We will identify the content the project needs and agree who is
              responsible for each part. Accurate business details, approved
              images, and timely feedback help keep things moving.
            </p>
            <p>
              Timing depends on the scope, content, and integrations. We agree a
              realistic schedule for your project before paid work begins.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.nextStep} aria-labelledby="process-next-step">
        <div className={`studio-container ${styles.nextStepGrid}`}>
          <div>
            <p className={styles.label}>Start with a free preview</p>
            <h2 id="process-next-step">
              See what this could look like for you.
            </h2>
            <p>
              Share what you do and what your website needs to make easier. We
              will arrange a short conversation about your preview.
            </p>
          </div>
          <PrimaryButton tone="light" className={styles.previewButton}>
            Request a free preview
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}
