import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

/**
 * Onest (variable, latin subset), self-hosted via next/font/local:
 * zero layout shift, no third-party request, no build-time network access.
 * Source: @fontsource-variable/onest (OFL-1.1).
 */
export const fontSans = localFont({
  src: "../assets/fonts/onest-latin-variable.woff2",
  variable: "--font-sans-family",
  weight: "100 900",
  display: "swap",
  preload: true,
});

export const fontMono = GeistMono;
