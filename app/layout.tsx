import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://0xdegend-portfolio.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "Olagboye Seyi (Oxdegend) — Frontend Engineer & Creative Developer",
    template: "%s · Olagboye Seyi",
  },
  description:
    "Portfolio of Olagboye Seyi (0xdegend) — Frontend Engineer crafting elegant digital experiences with React, Three.js, GSAP, AI & Blockchain.",
  keywords: [
    "Frontend Engineer",
    "Creative Developer",
    "React",
    "Next.js",
    "Three.js",
    "GSAP",
    "Motion",
    "AI Engineer",
    "Blockchain",
    "Web3",
    "TypeScript",
    "Olagboye Seyi",
    "0xdegend",
  ],
  authors: [{ name: "Olagboye Seyi", url: BASE_URL }],
  creator: "Olagboye Seyi",
  publisher: "Olagboye Seyi",

  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Olagboye Seyi — Portfolio",
    title: "Olagboye Seyi — Frontend Engineer & Creative Developer",
    description:
      "Crafting elegant digital experiences with React, Three.js, GSAP, AI & Blockchain.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Olagboye Seyi — Frontend Engineer & Creative Developer",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image", // big image preview
    site: "@0xdegend", // ← your Twitter/X handle
    creator: "@0xdegend",
    title: "Olagboye Seyi (0xdegend) — Frontend Engineer & Creative Developer",
    description:
      "Crafting elegant digital experiences with React, Three.js, GSAP, AI & Blockchain.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Olagboye Seyi",
              alternateName: "0xdegend",
              url: BASE_URL,
              jobTitle: "Frontend Engineer",
              description:
                "Frontend Engineer & Creative Developer specialising in React, Three.js, GSAP, AI & Blockchain.",
              sameAs: [
                "https://twitter.com/0xdegend",
                "https://github.com/0xdegend",
                "https://www.linkedin.com/in/olagboye-seyi/",
              ],
              knowsAbout: [
                "React",
                "Next.js",
                "TypeScript",
                "Three.js",
                "GSAP",
                "Blockchain",
                "Web3",
                "AI Engineering",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-cream text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
