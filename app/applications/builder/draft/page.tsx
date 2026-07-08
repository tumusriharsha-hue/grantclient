import type { Metadata } from "next";
import { ViewDraftPage } from "@/components/applications";

export const metadata: Metadata = {
  title: "View Draft",
};

export default function ViewDraftRoute() {
  return <ViewDraftPage />;
}
