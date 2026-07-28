import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthPage } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <Suspense fallback={null}>
      <AuthPage mode="signup" nonce={nonce} />
    </Suspense>
  );
}
