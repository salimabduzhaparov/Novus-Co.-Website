import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteScrollReset } from "@/components/RouteScrollReset";
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Novus Co.",
    images: [
      {
        url: "/social-card.jpg",
        width: 1200,
        height: 630,
        alt: "Novus Co. — Thoughtful websites for local businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-card.jpg"],
  },
  icons: { icon: "/brand/icon.png", apple: "/brand/icon.png" },
};
export const viewport: Viewport = { themeColor: "#f3f5f9" };
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.novuswebsites.com/#organization",
  name: "Novus Co.",
  url: "https://www.novuswebsites.com",
  logo: "https://www.novuswebsites.com/brand/novus-logo.webp",
  email: "salim.novusco@gmail.com",
  description: "Website design and development for local service businesses.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
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
