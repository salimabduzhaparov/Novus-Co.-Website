import { PrimaryButton } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <section className="studio-container section-space">
      <span className="eyebrow">404 / Page not found</span>
      <h1 className="section-title mt-8">Let’s get you back on track.</h1>
      <p className="page-copy mt-6 mb-8">
        This page may have moved, or the link may be incorrect.
      </p>
      <PrimaryButton href="/">Back to Novus</PrimaryButton>
    </section>
  );
}
