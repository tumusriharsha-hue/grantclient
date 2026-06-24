import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
