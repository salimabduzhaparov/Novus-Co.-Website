import CountUp from "@/components/ui/CountUp";
import styles from "./customer-evidence.module.css";

const evidence = [
  {
    id: "website",
    value: 54,
    statement:
      "of consumers said they were likely to visit a business’s website after reading positive reviews.",
    takeaway: "Give that interest somewhere to go.",
    report: "Local Consumer Review Survey 2026",
    url: "https://www.brightlocal.com/research/local-consumer-review-survey/",
    date: "2026-02-11",
    displayDate: "11 February 2026",
    sample:
      "Representative panel of 1,002 US adult consumers, surveyed through SurveyMonkey.",
    context:
      "Respondents selected actions they were likely to take after positive reviews. They could choose more than one; this measures stated likelihood, not tracked website visits.",
  },
  {
    id: "information",
    value: 85,
    statement:
      "of consumers considered contact information and opening hours important when researching local businesses.",
    takeaway: "Make the essentials easy to find.",
    report: "Consumer Search Behavior 2025",
    url: "https://www.brightlocal.com/research/consumer-search-behavior/",
    date: "2025-04-29",
    displayDate: "29 April 2025",
    sample:
      "Survey of 1,000 US consumers about their search habits and preferences.",
    context:
      "This finding concerns business information across online channels. It does not measure website quality or the number of customers a website generates.",
  },
  {
    id: "choice",
    value: 52,
    statement:
      "of recent local searchers looked at a business and decided not to contact it during their latest search.",
    takeaway: "Help people feel ready to get in touch.",
    report: "Consumer Search Behavior: Decisions, 2026",
    url: "https://www.brightlocal.com/research/consumer-search-behavior-decisions/",
    date: "2026-07-15",
    displayDate: "15 July 2026",
    sample:
      "Representative panel of 1,227 US consumers who had searched online for a local business in the previous three months.",
    context:
      "Respondents recalled their latest search. This includes all reasons for not contacting a business; it is not the percentage lost because of a missing or outdated website.",
  },
] as const;

export default function CustomerEvidence() {
  return (
    <section
      id="why-a-website"
      className={styles.section}
      aria-labelledby="customer-evidence-title"
    >
      <div className={`studio-container ${styles.inner}`}>
        <div className={styles.intro}>
          <div>
            <p className={styles.label}>Why your website matters</p>
            <h2 id="customer-evidence-title" className={styles.heading}>
              The decision happens before the call.
            </h2>
          </div>
          <p className={styles.description}>
            A confusing website can leave customers with questions. No website
            can leave them with even fewer answers. If people cannot see what
            you do or how to reach you, they may choose a competitor who makes
            it easier.
          </p>
        </div>

        <ul className={styles.figures}>
          {evidence.map((stat) => (
            <li key={stat.id} className={styles.figure}>
              <p className={styles.statement}>
                <CountUp
                  value={stat.value}
                  suffix="%"
                  className={styles.number}
                />{" "}
                <span>{stat.statement}</span>
              </p>
              <div className={styles.rail} aria-hidden="true">
                <span style={{ width: `${stat.value}%` }} />
              </div>
              <p className={styles.takeaway}>{stat.takeaway}</p>

              <details className={styles.source}>
                <summary>
                  Source and context
                  <span className="sr-only"> for {stat.value}%</span>
                </summary>
                <div className={styles.sourceContent}>
                  <a href={stat.url}>BrightLocal: {stat.report}</a>
                  <p>
                    Published{" "}
                    <time dateTime={stat.date}>{stat.displayDate}</time>.{" "}
                    {stat.sample}
                  </p>
                  <p>{stat.context}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <p className={styles.note}>
          Source: BrightLocal US consumer surveys, 2025–2026. Each survey has a
          different question and sample. These findings are not a forecast of
          results for your business.
        </p>
      </div>
    </section>
  );
}
