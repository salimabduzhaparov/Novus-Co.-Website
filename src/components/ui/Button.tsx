import Link from "next/link";
import type { ReactNode } from "react";
export function PrimaryButton({
  children,
  href = "/book",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Link href={href} className="button-primary">
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
export function SecondaryButton({
  children,
  href = "/work",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Link href={href} className="button-secondary">
      {children}
      <span aria-hidden="true">↗</span>
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
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
