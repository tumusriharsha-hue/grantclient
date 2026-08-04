import { NextResponse } from "next/server";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const siteOrigin = getSiteOrigin(origin);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, siteOrigin));
    }
  }

  return NextResponse.redirect(new URL("/login", siteOrigin));
}
