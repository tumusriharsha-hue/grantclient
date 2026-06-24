import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";

export default function SignInPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
