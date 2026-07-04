"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrimaryButton } from "./ui/Button";
import { HeroOrbit } from "./HeroOrbit";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const orbitWrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=120%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
          orbitWrapRef.current,
          { scale: 1, opacity: 1 },
          { scale: 1.35, opacity: 0, ease: "none", duration: 0.7 },
          0,
        )
        .fromTo(
          contentRef.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -40, ease: "none", duration: 0.6 },
          0,
        )
        .fromTo(
          hintRef.current,
          { opacity: 1 },
          { opacity: 0, ease: "none", duration: 0.25 },
          0,
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #16234a 0%, #070b16 55%, #05070d 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-32 text-center sm:px-10 sm:py-0">
        <div
          ref={orbitWrapRef}
          className="flex shrink-0 scale-[0.78] items-center justify-center sm:scale-95 lg:scale-100"
          style={{ willChange: "transform, opacity" }}
        >
          <HeroOrbit />
        </div>

        <div ref={contentRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Websites that make local businesses{" "}
              <span className="bg-gradient-to-r from-accent-light to-accent-glow bg-clip-text text-transparent">
                impossible to ignore.
              </span>
            </h1>
            <div className="mt-8 flex justify-center">
              <PrimaryButton href="/book">Book a 10-minute preview call</PrimaryButton>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-silver-dim"
      >
        Scroll ↓
      </div>
    </section>
  );
}
