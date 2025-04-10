import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  // Force use of NEXT_PUBLIC_APP_URL without fallback to prevent localhost:8080 issue
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // If NEXT_PUBLIC_APP_URL is not set, log a warning and use a default
  if (!appUrl) {
    console.warn("NEXT_PUBLIC_APP_URL is not set. Using request origin as fallback.");
    // You might want to set a specific default URL here instead of using requestUrl.origin
  }

  const redirectBase = appUrl || requestUrl.origin;
  
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(`${redirectBase}/login`);

  return NextResponse.redirect(`${redirectBase}/dashboard`);
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
