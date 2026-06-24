import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
