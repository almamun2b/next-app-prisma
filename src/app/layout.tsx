import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SkipLink } from "@/components/layout/skip-link";
import { Providers } from "@/components/providers/providers";
import { siteConfig } from "@/config/site";
import { fontMono, fontSans } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...buildMetadata(),
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#16171c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-dvh">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
