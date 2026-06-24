import type { Metadata } from "next";
import { GrantDetailView } from "@/components/grants";

interface BrowseDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BrowseDetailProps): Promise<Metadata> {
  const { id } = await params;
  return { title: id.replace(/-/g, " ") };
}

export default async function BrowseDetailPage({ params }: BrowseDetailProps) {
  const { id } = await params;
  return <GrantDetailView grantId={id} publicMode />;
}
