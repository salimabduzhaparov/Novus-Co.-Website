import { Reveal } from "./ui/Reveal";
import { PrimaryButton, SecondaryButton } from "./ui/Button";
import { OrbitMark } from "./ui/OrbitMark";
import { CONTACT_EMAIL } from "@/lib/content";

export function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-32 text-center sm:py-40"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(47,109,246,0.16) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <Reveal>
          <div className="mb-8 flex justify-center opacity-80">
            <OrbitMark size={72} />
          </div>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent-light/70" />
            <span
              className="text-xs font-bold tracking-[0.32em] text-accent-light uppercase"
              style={{ textShadow: "0 0 18px rgba(127,168,255,0.55)" }}
            >
              Get Started
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent-light/70" />
          </div>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Ready to turn first impressions into booked calls?
          </h2>
          <p className="mt-5 text-silver">
            A 10-minute call. No pressure, no obligation.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton href="/book">Book a 10-minute preview call</PrimaryButton>
            <SecondaryButton href="/contact">Contact us</SecondaryButton>
          </div>
          <p className="mt-6 text-xs text-silver-dim">
            Prefer email?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-light hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
