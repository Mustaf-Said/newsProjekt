import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
/* import WeglotScript from "@/components/WeglotScript"; */

// Initialize cron job for news updates
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  // This runs only on the server
  try {
    const { initializeNewsCronJob } = require("@/lib/cronScheduler");
    initializeNewsCronJob();
  } catch (error) {
    console.error("Failed to initialize news cron job:", error);
  }
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://raygalroyal.com"),

  title: {
    default: "Raygal Royal",
    template: "%s | Raygal Royal",
  },

  description:
    "Raygal Royal is a news, marketplace, and live information platform delivering trusted updates.",

  keywords: [
    "Somali news",
    "Raygal Royal",
    "Somalia updates",
    "Marketplace Somalia",
  ],

  openGraph: {
    title: "Raygal Royal",
    description:
      "News, marketplace, and live information platform.",
    url: "https://raygalroyal.com",
    siteName: "Raygal Royal",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "so_SO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Raygal Royal",
    description:
      "News, marketplace, and live information platform.",
    images: ["/logo2.png"],
  },

  icons: {
    icon: "/logo2.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="so-SO">

      <body>
        <Providers>
          {children}
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              name: "Raygal Royal",
              url: "https://raygalroyal.com",
              logo: "https://raygalroyal.com/logo2.png",
              sameAs: [
                "https://facebook.com/raygalroyal",
                "https://twitter.com/raygalroyal"
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
