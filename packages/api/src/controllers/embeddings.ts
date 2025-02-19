import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Request, Response } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import type { Database } from "@supavec/web/src/types/supabase";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";

const embeddingsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  k: z.number().int().positive().default(3),
  include_vectors: z.boolean().optional(),
  include_raw_file: z.boolean().optional(),
  file_ids: z.array(z.string().uuid()).min(
    1,
    "At least one file ID is required",
  ),
});

type EmbeddingsRequest = z.infer<typeof embeddingsSchema>;

async function validateRequest(req: Request): Promise<{
  success: boolean;
  data?: EmbeddingsRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiKeyData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  statusCode?: number;
}> {
  // Validate request body
  const validationResult = embeddingsSchema.safeParse(req.body);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues,
      statusCode: 400,
    };
  }

  // Validate API key and get team ID
  const apiKey = req.headers.authorization as string;
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from("api_keys")
    .select("team_id, user_id, profiles(email)")
    .match({ api_key: apiKey })
    .single();

  if (apiKeyError || !apiKeyData?.team_id) {
    return {
      success: false,
      error: "Invalid API key",
      statusCode: 401,
    };
  }

  // Verify file ownership
  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("file_id")
    .in("file_id", validationResult.data.file_ids)
    .match({ team_id: apiKeyData.team_id });

  if (filesError) {
    throw new Error(`Failed to verify file ownership: ${filesError.message}`);
  }

  if (!files || files.length !== validationResult.data.file_ids.length) {
    return {
      success: false,
      error: "One or more files do not belong to your team",
      statusCode: 403,
    };
  }

  return {
    success: true,
    data: validationResult.data,
    apiKeyData,
  };
}

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getEmbeddings = async (req: Request, res: Response) => {
  try {
    const validation = await validateRequest(req);
    if (!validation.success) {
      return res.status(validation.statusCode!).json({
        success: false,
        error: validation.error,
      });
    }

    const { query, k, file_ids } = validation.data!;

    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        model: "text-embedding-3-small",
      }),
      {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
        filter: file_ids ? { file_id: { in: file_ids } } : undefined,
      },
    );

    const similaritySearchWithScoreResults = await vectorStore
      .similaritySearchWithScore(query, k);
    const documentsResponse = [];
    for (const [doc, score] of similaritySearchWithScoreResults) {
      documentsResponse.push({
        content: doc.pageContent,
        file_id: doc.metadata.file_id,
        score: score.toFixed(3),
      });
    }

    client.capture({
      distinctId: validation.apiKeyData.profiles?.email as string,
      event: "/embeddings API Call",
    });

    const response = {
      success: true,
      documents: documentsResponse,
    };

    logApiUsageAsync({
      endpoint: "/embeddings",
      userId: validation.apiKeyData.user_id || "",
      success: true,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in embeddings endpoint:", error);

    if (req.headers.authorization) {
      const apiKey = req.headers.authorization as string;
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/embeddings",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
