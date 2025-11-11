import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: Parameters<typeof res.cookies.set>[2]) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: Parameters<typeof res.cookies.set>[2]) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );
  // If regular Chrome has stale Supabase cookies, gracefully clear them.
  const clearSbCookies = () => {
    try {
      const sbCookies = request.cookies.getAll().filter((c) => c.name.startsWith("sb-"));
      sbCookies.forEach((c) => res.cookies.set({ name: c.name, value: "", maxAge: 0, path: "/" }));
    } catch {}
  };

  let user = null as null | { id: string };
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      clearSbCookies();
    } else {
      user = data.user;
    }
  } catch {
    clearSbCookies();
  }

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/protected");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return res;
}
