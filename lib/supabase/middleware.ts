import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from "@/lib/auth/constants";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { isAuthenticatedUser } from "@/lib/auth/session";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function updateSession(
  request: NextRequest,
  requestHeaders = new Headers(request.headers),
) {
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
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

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const requestedPath = `${pathname}${request.nextUrl.search}`;

  if (isProtected && !isAuthenticatedUser(user)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", sanitizeRedirectPath(requestedPath));
    return NextResponse.redirect(loginUrl);
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
