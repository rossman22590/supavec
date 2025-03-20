"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user?.id) {
    return {
      error: "User not found",
    };
  }

  const { error } = await supabaseAdmin.from("onboarding_answers").insert({
    user_id: user.data.user.id,
    goal: formData.get("goal")?.toString() ?? null,
    how_know: formData.get("how_know")?.toString() ?? null,
    job: formData.get("job")?.toString() ?? null,
    name: formData.get("name")?.toString() ?? null,
  });

  if (error) {
    return {
      error: "Failed to complete onboarding",
    };
  }

  await supabaseAdmin.from("profiles").update({
    onboarding_at: new Date().toISOString(),
  }).match({
    id: user.data.user.id,
  });

  redirect("/onboarding/complete");
}
