"use client";

import { useEffect, useRef } from "react";

type CountUpProps = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

// An original, lightweight implementation of an in-view number reveal.
// The final value is server-rendered and remains the accessible value throughout.
export default function CountUp({
  value,
  suffix = "",
  duration = 900,
  className,
}: CountUpProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const number = numberRef.current;
    if (!number || !Number.isFinite(value)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finalText = String(value);
    let frame = 0;
    let started = false;

    const finish = () => {
      cancelAnimationFrame(frame);
      number.textContent = finalText;
      observer?.disconnect();
    };

    const handleMotionChange = () => {
      if (reducedMotion.matches) finish();
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const animationDuration = Math.min(1200, Math.max(1, duration));
    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        observer?.disconnect();

        if (reducedMotion.matches) {
          finish();
          return;
        }

        let start: number | undefined;
        const tick = (time: number) => {
          start ??= time;
          const progress = Math.min((time - start) / animationDuration, 1);
          const eased = 1 - (1 - progress) ** 3;
          number.textContent = String(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
          else number.textContent = finalText;
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.65 },
    );

    observer.observe(number);
    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      finish();
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, [duration, value]);

  return (
    <span className={className}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        <span ref={numberRef}>{value}</span>
        {suffix}
      </span>
    </span>
  );
}
