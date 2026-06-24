import type { Metadata } from "next";
import { GrantFinderPage } from "@/components/grants";

export const metadata: Metadata = {
  title: "Grant Finder",
};

export default function GrantsPage() {
  return <GrantFinderPage />;
}
