import { redirect } from "next/navigation";

interface BrowseDetailProps {
  params: Promise<{ id: string }>;
}

export default async function BrowseDetailPage({ params }: BrowseDetailProps) {
  const { id } = await params;

  redirect(`/grants/${encodeURIComponent(id)}`);
}
