import Link from "next/link";
import type { ReactNode } from "react";

/** Shared content for navigation links and real form submit buttons. */
export function ButtonContent({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="button-label">{children}</span>
      <span className="button-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12m-5-5 5 5-5 5" />
        </svg>
      </span>
    </>
  );
}

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
      <ButtonContent>{children}</ButtonContent>
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
