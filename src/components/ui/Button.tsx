import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Original Novus treatment informed by the 21st.dev Motion Button and
 * Interactive Hover Button: a stable label with a restrained arrow tile.
 * No third-party component source or extra animation package is required.
 */
export function PrimaryButton({
  children,
  href = "/book",
  className = "",
  tone = "brand",
  size = "default",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  tone?: "brand" | "light";
  size?: "default" | "large";
}) {
  return (
    <Link
      href={href}
      className={`button-primary ${className}`}
      data-tone={tone}
      data-size={size}
    >
      <span className="button-label">{children}</span>
      <span className="button-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M5 15 15 5M5 5h10v10" />
        </svg>
      </span>
    </Link>
  );
}
export function SecondaryButton({
  children,
  href = "/services",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Link href={href} className="button-secondary">
      {children}
      <span className="button-direction" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
export function TextLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <span className="button-direction" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
