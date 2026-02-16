import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
/* import WeglotScript from "@/components/WeglotScript"; */
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
