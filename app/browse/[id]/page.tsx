import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrantDetailView } from "@/components/grants";
import { getGrantById } from "@/lib/grants/queries";
import { scoreGrant } from "@/lib/grant-matching";

interface BrowseDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BrowseDetailProps): Promise<Metadata> {
  const { id } = await params;
  const grant = await getGrantById(id);

  return {
    title: grant?.title ?? id.replace(/-/g, " "),
  };
}

export default async function BrowseDetailPage({ params }: BrowseDetailProps) {
  const { id } = await params;
  const grant = await getGrantById(id);

  if (!grant) {
    notFound();
  }

  return <GrantDetailView grant={scoreGrant(grant, null)} publicMode />;
}
