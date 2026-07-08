import { NextResponse, type NextRequest } from "next/server";
import { FULL_ACCOUNT_ROUTES, PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from "@/lib/auth/constants";
import { DEV_FULL_ACCESS_COOKIE, isDevFullAccessEnabled } from "@/lib/auth/dev-access";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { isAuthenticatedUser, isGuestUser } from "@/lib/auth/session";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const requiresFullAccount = FULL_ACCOUNT_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const hasDevFullAccess = isDevFullAccessEnabled(
    request.cookies.get(DEV_FULL_ACCESS_COOKIE)?.value,
  );

  if (isProtected && (!user || isGuestUser(user)) && !hasDevFullAccess) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", sanitizeRedirectPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (requiresFullAccount && isGuestUser(user) && !hasDevFullAccess) {
    const signupUrl = request.nextUrl.clone();
    signupUrl.pathname = "/signup";
    signupUrl.searchParams.set("reason", "account");
    return NextResponse.redirect(signupUrl);
  }

  if (
    user &&
    isAuthenticatedUser(user) &&
    PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
