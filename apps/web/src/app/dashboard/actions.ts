"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateApiKey() {
  const supabase = await createClient();
  const { data: teamMemberships } = await supabase
    .from("team_memberships")
    .select("id, teams(name, id)");

  type TeamMembershipWithTeam = {
    id: string;
    teams: { id: string; name: string | null } | null;
  };

  const memberships = (teamMemberships ?? []) as TeamMembershipWithTeam[];
  const teamId = memberships[0]?.teams?.id;
  if (!teamId) {
    return;
  }

  await supabase.from("api_keys").insert({
    team_id: teamId,
  });

  revalidatePath("/dashboard");
}
