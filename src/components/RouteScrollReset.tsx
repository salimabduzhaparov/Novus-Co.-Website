"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Next preserves position if part of the incoming page is still in view.
 * A clicked Home or Process link should instead open the beginning. Remember that
 * explicit click so ordinary history restoration and hash links keep working.
 */
export function RouteScrollReset() {
  const pathname = usePathname();
  const pendingPath = useRef<string | null>(null);
  const frame = useRef<number | null>(null);

  const resetAfterLayout = (targetPath: string) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    // Wait for the outgoing pinned timeline to remove its spacer, and for
    // Next's own navigation scroll handling to finish. No ongoing scroll lock.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (window.location.pathname === targetPath) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      });
    });
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }
      const destination = new URL(link.href, window.location.href);
      // A newer link click takes precedence, including a same-page hash link.
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      if (
        destination.origin !== window.location.origin ||
        !["/", "/process"].includes(destination.pathname) ||
        destination.hash
      ) {
        pendingPath.current = null;
        return;
      }
      pendingPath.current = destination.pathname;
      if (window.location.pathname === destination.pathname) {
        pendingPath.current = null;
        resetAfterLayout(destination.pathname);
      }
    };
    const onHistory = () => {
      pendingPath.current = null;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onHistory);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onHistory);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingPath.current === pathname) {
      pendingPath.current = null;
      resetAfterLayout(pathname);
    }
  }, [pathname]);

  return null;
}
