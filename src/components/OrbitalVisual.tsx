"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
function subscribe(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function reducedSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function OrbitalVisual() {
  const reduced = useSyncExternalStore(subscribe, reducedSnapshot, () => true);
  const [allowed, setAllowed] = useState(true);
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const enabled = allowed && !reduced;
  useEffect(() => {
    const clip = video.current;
    if (!enabled || !clip) return;
    let frame = 0;
    function update() {
      frame = 0;
      if (!clip || !Number.isFinite(clip.duration) || clip.seeking) return;
      const end = art.current
        ? art.current.getBoundingClientRect().top +
          window.scrollY +
          art.current.offsetHeight
        : 850;
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(end, 1)),
      );
      const target = progress * (clip.duration - 0.04);
      if (Math.abs(clip.currentTime - target) > 0.04) clip.currentTime = target;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    clip.addEventListener("loadeddata", onScroll);
    clip.addEventListener("seeked", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      clip.removeEventListener("loadeddata", onScroll);
      clip.removeEventListener("seeked", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);
  return (
    <div className="hero-art" ref={art}>
      <div className="orbital-media" aria-hidden="true">
        <Image
          src="/media/novus-orbit.webp"
          alt=""
          fill
          sizes="(max-width: 760px) 95vw, 55vw"
          priority
        />
        {enabled && (
          <video
            ref={video}
            src="/media/novus-orbit.mp4"
            poster="/media/novus-orbit.webp"
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setReady(true)}
            style={{ opacity: ready ? 1 : 0 }}
          />
        )}
      </div>
      {!reduced && (
        <button
          type="button"
          className="motion-control"
          aria-pressed={allowed}
          onClick={() => setAllowed(!allowed)}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path d={allowed ? "M8 7v6m4-6v6" : "m8 6 6 4-6 4Z"} />
          </svg>
          {allowed ? "Scroll to set things in motion" : "Motion off"}
        </button>
      )}
    </div>
  );
}
