import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewDraftPage } from "@/components/applications";
import { normalizeDraftSections } from "@/lib/applications/defaults";
import {
  getCurrentUserApplicationById,
  getCurrentUserApplicationSections,
} from "@/lib/applications/queries";

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

  const storedSections = await getCurrentUserApplicationSections(application.id);

  return (
    <ViewDraftPage
      applicationId={application.id}
      title={application.title}
      sections={
        storedSections.length > 0
          ? storedSections
          : normalizeDraftSections(application.draft_content)
      }
      savedAt={application.updated_at}
    />
  );
}
