import Link from "next/link";
import { Logo } from "./ui/Logo";
import { CONTACT_EMAIL } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative border-t border-hairline px-6 py-16 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col justify-between gap-12 sm:flex-row">
        <div>
          <Link href="/" className="flex items-center">
            <Logo size={28} />
          </Link>
          <p className="mt-4 max-w-[220px] text-xs leading-relaxed text-silver-dim">
            Websites for home-service businesses that want to look as good as
            the work they do.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <h5 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-silver-dim">
              Site
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-silver">
              <Link href="/services" className="hover:text-ink">Services</Link>
              <Link href="/reviews" className="hover:text-ink">Reviews</Link>
              <Link href="/process" className="hover:text-ink">Process</Link>
              <Link href="/statistics" className="hover:text-ink">Statistics</Link>
              <Link href="/about" className="hover:text-ink">About</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-silver-dim">
              Contact
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-silver">
              <Link href="/contact" className="hover:text-ink">Contact</Link>
              <Link href="/book" className="hover:text-ink">Book a Call</Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-5xl text-xs text-silver-dim">
        © {new Date().getFullYear()} Novus Co. All rights reserved.
      </div>
    </footer>
  );
}
