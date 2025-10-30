import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // Edge-safe session check without importing Supabase client.
  // We detect a Supabase session by presence of known auth cookies.
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const hasSupabaseSession = cookieNames.some((name) =>
    name === "sb-access-token" ||
    name === "sb:token" ||
    (name.startsWith("sb-") && name.includes("access-token")) ||
    name === "supabase-auth-token"
  );

  if (
    !hasSupabaseSession &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/api/protected"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
