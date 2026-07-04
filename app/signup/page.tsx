import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}
