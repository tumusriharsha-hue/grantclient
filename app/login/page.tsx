import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="signin" />
    </Suspense>
  );
}
