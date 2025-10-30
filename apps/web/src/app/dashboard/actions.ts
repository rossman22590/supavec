"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateApiKey() {
  const supabase = await createClient();
  type TeamMembership = Pick<import("@/types/supabase").Tables<"team_memberships">, "team_id">;
  const { data: teamMemberships } = await supabase
    .from("team_memberships")
    .select("team_id")
    .limit(1)
    .returns<TeamMembership[]>();

  if (!teamMemberships?.[0]?.team_id) {
    return;
  }

  const toInsert = { team_id: teamMemberships[0].team_id } satisfies import("@/types/supabase").TablesInsert<"api_keys">;
  // Supabase types may not flow in this file; cast table builder to any to satisfy insert overload.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("api_keys") as any).insert(toInsert);

  revalidatePath("/dashboard");
}
