import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@supavec/web/src/types/supabase";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const requestSchema = z.object({
  pagination: z
    .object({
      limit: z.number().positive().default(10),
      offset: z.number().nonnegative().default(0),
    })
    .default({ limit: 10, offset: 0 }),
  order_dir: z.enum(["asc", "desc"]).default("desc"),
});

export const userFiles = async (req: Request, res: Response) => {
  try {
    const validation = requestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request parameters",
        details: validation.error.errors,
      });
    }

    const { pagination, order_dir } = validation.data;

    // Get team ID from API key
    const apiKey = req.headers.authorization as string;
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("team_id, user_id, profiles(email)")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      return res.status(401).json({
        success: false,
        error: "Invalid API key",
      });
    }

    const teamId = apiKeyData.team_id;

    // Fetch files with pagination
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("type, file_id, created_at, file_name, team_id")
      .match({ team_id: teamId })
      .is("deleted_at", null)
      .range(pagination.offset, pagination.offset + pagination.limit - 1)
      .order("created_at", { ascending: order_dir === "asc" });

    if (filesError) {
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("files")
      .select("id", {
        count: "exact",
        head: true,
      })
      .match({ team_id: teamId });

    if (countError) {
      throw new Error(`Failed to get total count: ${countError.message}`);
    }

    client.capture({
      distinctId: apiKeyData.profiles?.email as string,
      event: "/user_files API Call",
    });

    logApiUsageAsync({
      endpoint: "/upload_files",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    return res.json({
      success: true,
      results: files,
      pagination: {
        ...pagination,
      },
      count,
    });
  } catch (error) {
    console.error("Error fetching user files:", error);

    if (req.headers.authorization) {
      const apiKey = req.headers.authorization as string;
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/upload_files",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: `Failed to fetch files${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};
