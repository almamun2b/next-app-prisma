import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Public, indexable pages only. Authenticated areas are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/login"), changeFrequency: "yearly", priority: 0.5 },
  ];
}
