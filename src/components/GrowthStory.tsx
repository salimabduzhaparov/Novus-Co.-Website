"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

const stages = [
  "Start with a clear website",
  "Connect your services and location",
  "Build a stronger search presence",
];
const seoFoundations = [
  {
    title: "Content that matches the search",
    copy: "Your services, the areas you cover and answers to common questions give every page a clear purpose.",
  },
  {
    title: "Clear titles and descriptions",
    copy: "Descriptive page titles and useful summaries help people understand what they will find before they click.",
  },
  {
    title: "Fast, connected pages",
    copy: "Mobile layouts, optimized assets and internal links make your website easier to explore and important pages easier to discover.",
  },
];
const resultOrders = [
  ["nearby", "another", "yours"],
  ["nearby", "yours", "another"],
  ["yours", "nearby", "another"],
];

export function GrowthStory() {
  const demonstration = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [intersecting, setIntersecting] = useState(false);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const current = reduce ? 2 : phase;

  useEffect(() => {
    const element = demonstration.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setVisible(!document.hidden);
        if (!entry.isIntersecting || entry.intersectionRatio === 0) {
          // Reset only once the entire demo has left the viewport. Moving
          // around the playback threshold pauses/resumes without restarting.
          setInView(false);
          setIntersecting(false);
          setPhase(0);
          return;
        }
        setIntersecting(true);
        setInView(entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!inView || !visible || paused || reduce || phase === 2) return;
    const timer = window.setTimeout(
      () => setPhase((value) => Math.min(2, value + 1)),
      1900,
    );
    return () => window.clearTimeout(timer);
  }, [inView, visible, paused, reduce, phase]);

  return (
    <section className={styles.section} aria-labelledby="growth-title">
      <div className="studio-container">
        <div className={styles.heading}>
          <span className={styles.label}>SEO &amp; search visibility</span>
          <h2 id="growth-title">
            SEO built in.
            <br />
            Move ahead in search.
          </h2>
          <p>
            Novus builds SEO into the structure, content and performance of your
            website—to help your business appear higher on Google when people
            search for what you offer.
          </p>
        </div>

        <div className={styles.demonstration} ref={demonstration}>
          <div className={styles.demoHeader}>
            <p>Illustrative search example</p>
            {!reduce && phase < 2 && (
              <button
                type="button"
                className={styles.control}
                onClick={() => setPaused((value) => !value)}
                aria-pressed={paused}
                aria-label={
                  paused
                    ? "Resume the search animation"
                    : "Pause the search animation"
                }
              >
                <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
                {paused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
          <div className={styles.searchWindow}>
            <div className={styles.chrome} aria-hidden="true">
              <span>● ● ●</span>
              <span>A stronger presence online</span>
              <span>↗</span>
            </div>
            <div
              className={styles.searchDemo}
              aria-label="Illustrative local search results"
            >
              <div className={styles.searchBar}>
                <span aria-hidden="true">⌕</span>
                <span>local businesses near me</span>
                <span aria-hidden="true">↵</span>
              </div>
              <div className={styles.searchTabs} aria-hidden="true">
                <span>All results</span>
                <span>Local businesses</span>
                <span>Maps</span>
              </div>
              <ol className={styles.results}>
                {resultOrders[current].map((id, index) => (
                  <motion.li
                    key={id}
                    // Keep projection active across the playback threshold so
                    // scrolling cannot interrupt a swap already in progress.
                    layout={reduce ? false : "position"}
                    transition={{
                      layout: {
                        duration: reduce || !intersecting ? 0 : 0.7,
                        ease: [0.2, 0, 0, 1],
                      },
                    }}
                    className={styles.result}
                    data-featured={id === "yours"}
                    data-leading={id === "yours" && current === 2}
                  >
                    <span className={styles.position} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.resultContent}>
                      <span className={styles.resultCategory}>
                        {id === "yours"
                          ? "Local expertise · Your service area"
                          : "Local services"}
                      </span>
                      <strong>
                        {id === "yours"
                          ? "Your Business"
                          : id === "nearby"
                            ? "Another local business"
                            : "A nearby service provider"}
                      </strong>
                      <p
                        className={
                          id === "yours" ? styles.resultDescription : undefined
                        }
                      >
                        {id === "yours" ? (
                          <>
                            <span aria-hidden={current !== 0}>
                              The services you offer. The people you help.
                            </span>
                            <span aria-hidden={current === 0}>
                              Clear services. Useful local information. A
                              website built for the next step.
                            </span>
                          </>
                        ) : (
                          "Business information and services in your area."
                        )}
                      </p>
                      {id === "yours" && (
                        <span className={styles.resultLinks}>
                          Services <i>·</i> Our work <i>·</i> Get in touch
                        </span>
                      )}
                    </div>
                    {id === "yours" && (
                      <span className={styles.better} aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
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
        </div>

        <div className={styles.foundationIntro}>
          <span>What goes into it</span>
          <h3>Search visibility starts with the details.</h3>
        </div>
        <div className={styles.foundations}>
          {seoFoundations.map((foundation, index) => (
            <article key={foundation.title}>
              <span className={styles.foundationNumber}>0{index + 1}</span>
              <h4>{foundation.title}</h4>
              <p>{foundation.copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.footer}>
          <Link href="/services#seo-foundations" className="text-link">
            Explore our SEO foundations <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
