import type { Metadata } from "next";
import { ApplicationBuilderPage } from "@/components/applications";
import { getGrantById } from "@/lib/grants/queries";

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
  const grant = grantId ? await getGrantById(grantId).catch(() => null) : null;

  return (
    <ApplicationBuilderPage
      grantContext={
        grant
          ? {
              id: grant.id,
              title: grant.title,
              funder: grant.funder,
              category: grant.category,
              deadline: grant.deadline,
              applicationUrl: grant.applicationUrl,
            }
          : null
      }
    />
  );
}
