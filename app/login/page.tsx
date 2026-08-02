import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/components/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign In",
  robots: noIndexRobots,
};

export default async function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="signin" />
    </Suspense>
  );
}
