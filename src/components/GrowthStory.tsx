"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import styles from "./growth-story.module.css";

/*
 * List animation adapted from Motiq's Animated List by Mahammad Rustamov,
 * retrieved via https://21st.dev/@rmahammad/components/animated-list.
 * Existing framer-motion replaces motion/react; Novus supplies layout and copy.
 *
 * MIT License — Copyright (c) 2026 Mahammad Rustamov
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const notifications = [
  {
    id: "quote",
    icon: "↗",
    title: "Quote request",
    detail: "A customer shares the work they need.",
  },
  {
    id: "call",
    icon: "↗",
    title: "Call enquiry",
    detail: "Your phone number is easy to find.",
  },
  {
    id: "visit",
    icon: "✓",
    title: "Visit arranged",
    detail: "You follow up and agree the next step.",
  },
];
const stages = [
  "Build the foundation",
  "Make your services clear",
  "Create a clear next step",
];

export function GrowthStory() {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.25 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const current = reduce ? 2 : phase;

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!inView || !visible || paused || reduce || phase === 2) return;
    const timer = window.setTimeout(
      () => setPhase((value) => Math.min(2, value + 1)),
      2600,
    );
    return () => window.clearTimeout(timer);
  }, [inView, visible, paused, reduce, phase]);

  const businesses =
    current === 0
      ? ["nearby", "another", "yours"]
      : ["nearby", "yours", "another"];
  const transition = {
    duration: reduce ? 0 : 0.5,
    ease: [0.2, 0, 0, 1] as const,
  };

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="growth-title"
    >
      <div className="studio-container">
        <div className={styles.heading}>
          <div>
            <span className={styles.label}>Visibility &amp; enquiries</span>
            <h2 id="growth-title">
              From being found
              <br />
              to being contacted.
            </h2>
          </div>
          <p>
            A useful website does two jobs: helps the right people discover your
            business, then gives them a reason to get in touch.
          </p>
        </div>
        <div className={styles.demoHeader}>
          <p>Illustrative example — not live results</p>
          {!reduce && (
            <button
              type="button"
              className={styles.control}
              onClick={() => {
                if (phase === 2) {
                  setPhase(0);
                  setPaused(false);
                } else setPaused((value) => !value);
              }}
              aria-label={
                phase === 2
                  ? "Replay the visibility and enquiry example"
                  : paused
                    ? "Resume the example animation"
                    : "Pause the example animation"
              }
            >
              <span aria-hidden="true">
                {phase === 2 ? "↻" : paused ? "▶" : "Ⅱ"}
              </span>
              {phase === 2 ? "Replay example" : paused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
        <div className={styles.panels}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <span>01</span>
              <h3>Help customers discover you.</h3>
            </div>
            <p className={styles.copy}>
              Clear service pages, useful local information and sound technical
              SEO give search engines more to understand.
            </p>
            <div
              className={styles.searchDemo}
              aria-label="Illustrative local search results"
            >
              <div className={styles.searchBar}>
                <span aria-hidden="true">⌕</span> plumber in Tampa
                <span className={styles.searchTag}>Example search</span>
              </div>
              <ul className={styles.results}>
                {businesses.map((id) => (
                  <motion.li
                    key={id}
                    layout={reduce ? false : "position"}
                    transition={transition}
                    className={styles.result}
                    data-featured={id === "yours"}
                  >
                    <span className={styles.resultIcon} aria-hidden="true">
                      {id === "yours" ? "✓" : "·"}
                    </span>
                    <div>
                      <strong>
                        {id === "yours"
                          ? "Your local business"
                          : id === "nearby"
                            ? "Another nearby business"
                            : "A local service provider"}
                      </strong>
                      <p>
                        {id === "yours"
                          ? current === 0
                            ? "Your website gives customers somewhere to learn more."
                            : "Plumbing services · Tampa · Work examples · Get a quote"
                          : "Local services and business information"}
                      </p>
                    </div>
                    {id === "yours" && current > 0 && (
                      <span
                        className={styles.better}
                        aria-label="Illustrative improved visibility"
                      >
                        ↗
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
            <p className={styles.note}>
              Search position varies by location, competition and relevance. No
              ranking is guaranteed.
            </p>
          </article>
          <article className={`${styles.panel} ${styles.enquiryPanel}`}>
            <div className={styles.panelHeader}>
              <span>02</span>
              <h3>Make the next step easier.</h3>
            </div>
            <p className={styles.copy}>
              Show your work, answer the first questions and put calls and quote
              requests within easy reach.
            </p>
            <div className={styles.inbox}>
              <div className={styles.inboxHeader}>
                <span>Customer enquiries</span>
                <span>Example journey</span>
              </div>
              <ul className={styles.notifications}>
                <AnimatePresence initial={false}>
                  {notifications.slice(0, current + 1).map((item) => (
                    <motion.li
                      key={item.id}
                      layout={reduce ? false : "position"}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: -8, scale: 0.98 }
                      }
                      transition={{
                        duration: reduce ? 0 : 0.26,
                        ease: [0.2, 0, 0, 1],
                      }}
                      className={styles.notification}
                    >
                      <span
                        className={styles.notificationIcon}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <span className={styles.sample}>Sample</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <p className={styles.note}>
              These sample enquiries explain the journey. They are not customer
              activity or a forecast of sales.
            </p>
          </article>
        </div>
        <div className={styles.footer}>
          <div
            className={styles.stages}
            aria-label="Website improvement stages"
          >
            {stages.map((stage, index) => (
              <span key={stage} data-complete={index <= current}>
                <i aria-hidden="true" />
                {stage}
              </span>
            ))}
          </div>
          <Link href="/services" className="text-link">
            Explore our services <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
