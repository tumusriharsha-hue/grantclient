import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewDraftPage } from "@/components/applications";
import { normalizeDraftSections } from "@/lib/applications/defaults";
import { getCurrentUserApplicationById } from "@/lib/applications/queries";

export const metadata: Metadata = {
  title: "View Draft",
};

interface ViewDraftRouteProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ViewDraftRoute({ searchParams }: ViewDraftRouteProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const application = await getCurrentUserApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <ViewDraftPage
      applicationId={application.id}
      title={application.title}
      sections={normalizeDraftSections(application.draft_content)}
      savedAt={application.updated_at}
    />
  );
}
