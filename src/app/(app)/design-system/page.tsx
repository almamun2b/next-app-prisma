import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/modules/auth/auth.guard";
import { ActionsShowcase } from "@/modules/design-system/components/actions-showcase";
import { InputsShowcase } from "@/modules/design-system/components/inputs-showcase";
import { ShowcaseSection } from "@/modules/design-system/components/showcase-section";

export const metadata: Metadata = { title: "Components" };

/** Living catalogue of the hand-built UI kit (see DESIGN.md). */
async function DesignSystemPageContent() {
  await requireUser();
  return (
    <div className="mx-auto grid w-full max-w-5xl animate-fade-in gap-6">
      <PageHeader
        title="Components"
        description="The reusable UI kit used across Keystone, in every state."
      />
      <ActionsShowcase />
      <InputsShowcase />
      <ShowcaseSection
        title="Pagination"
        description="Link-based, crawlable and keyboard accessible."
      >
        <Pagination page={4} totalPages={12} hrefForPage={() => "/design-system"} />
      </ShowcaseSection>
    </div>
  );
}

/** Each page owns a Suspense boundary so client navigations stay instant. */
export default function DesignSystemPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DesignSystemPageContent />
    </Suspense>
  );
}
