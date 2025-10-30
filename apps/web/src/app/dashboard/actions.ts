"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert } from "@/types/supabase";

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

  const payload: TablesInsert<"api_keys">[] = [{ team_id: teamId }];
  await supabase.from("api_keys" as const).insert(payload);

  revalidatePath("/dashboard");
}
