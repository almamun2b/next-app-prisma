import type { Metadata } from "next";
import {
  JsonLd,
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { Features } from "@/modules/marketing/components/features";
import { Hero } from "@/modules/marketing/components/hero";
import { Security } from "@/modules/marketing/components/security";

export const metadata: Metadata = buildMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd, websiteJsonLd, softwareJsonLd]} />
      <Hero />
      <Features />
      <Security />
    </>
  );
}
