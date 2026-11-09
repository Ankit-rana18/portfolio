import type { Metadata, Viewport } from "next";
import { Barlow, Instrument_Serif, Kanit } from "next/font/google";
import { profile, seo } from "@/content/site";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});
// Hero only: Instrument Serif italic headings + Barlow body.
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const barlow = Barlow({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  authors: [{ name: profile.name, url: profile.github }],
  keywords: [
    "Ankit Rana",
    "Data Scientist",
    "Generative AI Engineer",
    "Machine Learning",
    "RAG",
    "LangChain",
    "Microsoft Fabric",
    "Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    title: seo.title,
    description: seo.description,
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0c0c0c", colorScheme: "dark" };

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.roles.join(", "),
  email: `mailto:${profile.email}`,
  url: seo.url,
  sameAs: [profile.github, profile.linkedin],
  alumniOf: ["Vellore Institute of Technology", "Techno India University"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kanit.variable} ${instrument.variable} ${barlow.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
