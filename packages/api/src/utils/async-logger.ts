import { createClient } from "@supabase/supabase-js";
import type { Database } from "@supavec/web/src/types/supabase";

const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type LogApiUsageParams = {
  endpoint: string;
  userId: string;
  success: boolean;
  error?: string;
};

export const logApiUsageAsync = (params: LogApiUsageParams): void => {
  setImmediate(async () => {
    try {
      await supabaseAdmin.from("api_usage_logs").insert({
        endpoint: params.endpoint,
        user_id: params.userId,
        success: params.success,
        error: params.error,
      });
    } catch (error) {
      console.error("Error logging API usage:", error);
    }
  });
};
