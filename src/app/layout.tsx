import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteScrollReset } from "@/components/RouteScrollReset";
import { CONTACT_EMAIL } from "@/lib/content";
const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://www.novuswebsites.com"),
  title: {
    default: "Web Design for Local Businesses | Novus Co.",
    template: "%s | Novus Co.",
  },
  description:
    "Websites for local service businesses, built around clear services, customer confidence and easier enquiries. Request a free website preview from Novus.",
  alternates: { canonical: "/" },
  // Keep shared links tied to the brand logo, independent of site artwork updates.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Novus Co.",
    images: [
      {
        url: "/brand/novus-logo.png",
        width: 1500,
        height: 540,
        type: "image/png",
        alt: "Novus Co. logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/brand/novus-logo.png",
        alt: "Novus Co. logo",
      },
    ],
  },
  icons: {
    icon: { url: "/brand/icon.png", type: "image/png", sizes: "256x256" },
    apple: "/brand/icon.png",
  },
};
export const viewport: Viewport = { themeColor: "#f3f5f9" };
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.novuswebsites.com/#organization",
  name: "Novus Co.",
  url: "https://www.novuswebsites.com",
  logo: "https://www.novuswebsites.com/brand/novus-logo.webp",
  email: CONTACT_EMAIL,
  description: "Website design and development for local service businesses.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} antialiased`}
    >
      <body>
        <RouteScrollReset />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      </body>
    </html>
  );
}
