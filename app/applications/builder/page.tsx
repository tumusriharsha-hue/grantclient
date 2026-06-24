import type { Metadata } from "next";
import { ApplicationBuilderPage } from "@/components/applications";

export const metadata: Metadata = {
  title: "Application Builder",
};

export default function ApplicationBuilderRoute() {
  return <ApplicationBuilderPage />;
}
