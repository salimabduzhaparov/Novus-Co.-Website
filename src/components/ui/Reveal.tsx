"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.animate || !("IntersectionObserver" in window))
      return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (motionPreference.matches) return;

    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (motionPreference.matches) return;

        // The server-rendered content is visible. Animation is optional polish,
        // with no hidden state or fill mode that can leave content concealed.
        animation = element.animate(
          [
            { transform: `translate3d(0, ${y}px, 0)`, opacity: 0.85 },
            { transform: "translate3d(0, 0, 0)", opacity: 1 },
          ],
          {
            duration: 650,
            delay: Math.max(0, delay) * 1000,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
        );
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.05 },
    );

    const stopIfReduced = () => {
      if (!motionPreference.matches) return;
      observer.disconnect();
      animation?.cancel();
    };

    observer.observe(element);
    motionPreference.addEventListener("change", stopIfReduced);

    return () => {
      observer.disconnect();
      animation?.cancel();
      motionPreference.removeEventListener("change", stopIfReduced);
    };
  }, [delay, y]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
