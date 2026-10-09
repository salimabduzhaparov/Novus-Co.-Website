import Link from "next/link";
import { Logo } from "./ui/Logo";
import { CONTACT_EMAIL } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer studio-container">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" aria-label="Novus Co. home">
            <Logo />
          </Link>
          <p>
            Thoughtful websites for local businesses. Clear by design. Built
            around you.
          </p>
        </div>
        <div className="footer-links">
          <h2>Explore</h2>
          <Link href="/work">Work & concepts</Link>
          <Link href="/services">Services</Link>
          <Link href="/process">Our process</Link>
          <Link href="/about">About Novus</Link>
        </div>
        <div className="footer-links">
          <h2>Start something</h2>
          <Link href="/book">Request a call ↗</Link>
          <Link href="/contact">Send a message</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Novus Co.</span>
        <span>Made with purpose. Built for what’s next.</span>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
