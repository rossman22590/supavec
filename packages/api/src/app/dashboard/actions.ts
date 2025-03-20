"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateApiKey() {
  const supabase = await createClient();
  const { data: teamMemberships } = await supabase
    .from("team_memberships")
    .select("id, teams(name, id)");

  if (!teamMemberships?.[0]?.teams?.id) {
    return;
  }

  await supabase.from("api_keys").insert({
    team_id: teamMemberships?.[0]?.teams?.id,
  });

  revalidatePath("/dashboard");
}
