import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
/* import WeglotScript from "@/components/WeglotScript"; */

// Initialize cron job for news updates
if (typeof window === "undefined") {
  // This runs only on the server
  try {
    const { initializeNewsCronJob } = require("@/lib/cronScheduler");
    initializeNewsCronJob();
  } catch (error) {
    console.error("Failed to initialize news cron job:", error);
  }
}

export const metadata = {
  title: "newsProjekt",
  description: "News, marketplace, and live information platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="so-SO">

      <body>
        <Providers>
          {children}</Providers>
      </body>
    </html>
  );
}
