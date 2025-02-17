import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use NEXT_PUBLIC_API_URL for redirects if it exists, otherwise fall back to requestUrl.origin
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || requestUrl.origin;

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}

// import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";

// export async function GET(request: Request) {
//   const requestUrl = new URL(request.url);
//   const code = requestUrl.searchParams.get("code");

//   const supabase = await createClient();

//   if (code) {
//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return NextResponse.redirect(`${requestUrl.origin}/login`);

//   return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
// }
