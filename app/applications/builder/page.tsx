import type { Metadata } from "next";
import { ApplicationBuilderPage } from "@/components/applications";
import { getGrantById } from "@/lib/grants/queries";
import { getOrganizationForUser } from "@/app/actions/organization";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Application Builder",
};

interface ApplicationBuilderRouteProps {
  searchParams: Promise<{ grant?: string }>;
}

export default async function ApplicationBuilderRoute({
  searchParams,
}: ApplicationBuilderRouteProps) {
  const { grant: grantId } = await searchParams;
  const [grant, organization] = await Promise.all([
    grantId ? getGrantById(grantId).catch(() => null) : null,
    getOrganizationForUser(),
  ]);

  if (!organization) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("organization_documents")
    .select("id, file_name")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (
    <ApplicationBuilderPage
      organization={{
        name: organization.organization_name,
        mission: organization.mission ?? "Mission statement pending.",
      }}
      documents={(documents ?? []).map((document) => ({
        id: document.id,
        fileName: document.file_name,
      }))}
      grantContext={
        grant
          ? {
              id: grant.id,
              title: grant.title,
              funder: grant.funder,
              category: grant.category,
              deadline: grant.deadline,
              verifiedAt: grant.verifiedAt,
              sourceUrl: grant.sourceUrl,
              questions: grant.applicationQuestions,
            }
          : null
      }
    />
  );
}
