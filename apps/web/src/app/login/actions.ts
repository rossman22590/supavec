"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function googleLogin() {
  const supabase = await createClient();
  
  // Force use of NEXT_PUBLIC_APP_URL without fallback to prevent localhost issues
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // Only use headers as fallback if absolutely necessary
  let redirectBase = appUrl;
  if (!redirectBase) {
    console.warn("NEXT_PUBLIC_APP_URL is not set. Using request origin as fallback.");
    const headersList = await headers();
    const origin = headersList.get("origin");
    // Provide a default value if origin is null
    redirectBase = origin || "https://rag-api-aitutor-beta.up.railway.app";
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectBase}/auth/callback`,
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(data.url);
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return redirect("/login");
};



// "use server";

// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { createClient } from "@/utils/supabase/server";
// import { headers } from "next/headers";

// export async function googleLogin() {
//   const supabase = await createClient();
//   const headersList = await headers();
//   const origin = headersList.get("origin");

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: `${origin}/auth/callback`,
//     },
//   });

//   if (error) {
//     redirect("/error");
//   }

//   revalidatePath("/", "layout");
//   redirect(data.url);
// }

// export const signOut = async () => {
//   const supabase = await createClient();
//   await supabase.auth.signOut();

//   revalidatePath("/", "layout");
//   return redirect("/login");
// };
