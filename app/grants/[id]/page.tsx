import type { Metadata } from "next";
import { GrantDetailView } from "@/components/grants";

interface GrantDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GrantDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export default async function GrantDetailPage({ params }: GrantDetailRouteProps) {
  const { id } = await params;
  return <GrantDetailView grantId={id} />;
}
