import type { ReactNode } from "react";
export function PageHero({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero studio-container">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  );
}
