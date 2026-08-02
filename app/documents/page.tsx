import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndexRobots,
};

export default function DocumentsRedirect() {
  redirect("/dashboard");
}
