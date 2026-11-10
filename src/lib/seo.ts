import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageSeo = {
  title?: string;
  description?: string;
  /** Path relative to the site root, used for the canonical URL. */
  path?: string;
  /** Private pages (dashboard etc.) must not be indexed. */
  noIndex?: boolean;
};

export const absoluteUrl = (path = "/") => new URL(path, `${siteConfig.url}/`).toString();

/** Builds consistent per-page metadata (canonical, Open Graph, Twitter, robots). */
export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: PageSeo = {}): Metadata {
  const desc = description ?? siteConfig.description;
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: title ?? siteConfig.title,
      description: desc,
    },
    twitter: { card: "summary_large_image", title: title ?? siteConfig.title, description: desc },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
  };
}
