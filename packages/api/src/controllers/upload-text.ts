import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { z } from "zod";
import { randomUUID } from "crypto";
import type { Database } from "@supavec/web/src/types/supabase";
import { updateLoopsContact } from "../utils/loops";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const uploadTextSchema = z.object({
  contents: z.string().min(5, "Content must be at least 5 characters long"),
  name: z.string().min(1).optional().default("Untitled Document"),
  chunk_size: z.coerce.number().positive().nullish(),
  chunk_overlap: z.coerce.number().positive().nullish(),
});

export const uploadText = async (req: Request, res: Response) => {
  try {
    // Validate body parameters
    const bodyValidation = uploadTextSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: bodyValidation.error.issues,
      });
    }

    const apiKey = req.headers.authorization as string;
    // Get team ID from API key
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

    const teamId = apiKeyData.team_id as string;

    const {
      contents,
      name,
      chunk_size = DEFAULT_CHUNK_SIZE,
      chunk_overlap = DEFAULT_CHUNK_OVERLAP,
    } = bodyValidation.data;

    const fileId = randomUUID();
    const fileName = `${fileId}.txt`;

    // Upload text content to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(`/${teamId}/${fileName}`, contents, {
        contentType: "text/plain",
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({
        success: false,
        error: "Failed to upload file to storage",
      });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
      chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
    });

    const docs = await splitter.createDocuments([contents], [{
      source: name,
      file_id: fileId,
    }]);

    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabase,
      tableName: "documents",
    });

    await supabase.from("files").insert({
      file_id: fileId,
      type: "text",
      file_name: `${name}.txt`,
      team_id: teamId,
      storage_path: storageData.path,
    });

    // Update Loops contact
    if (apiKeyData.profiles?.email) {
      try {
        updateLoopsContact({
          email: apiKeyData.profiles.email,
          isFileUploaded: true,
        });
      } catch (error) {
        console.error("Error updating Loops contact:", error);
      }
    }

    client.capture({
      distinctId: apiKeyData.profiles?.email as string,
      event: "text_upload_completed",
      properties: {
        file_name: fileName,
        file_type: "text",
        file_size: contents.length,
      },
    });

    logApiUsageAsync({
      endpoint: "/upload_text",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    return res.status(200).json({
      success: true,
      message: "Text uploaded and processed successfully",
      file_id: fileId,
    });
  } catch (error) {
    console.error("Error processing text upload:", error);

    if (req.headers.authorization) {
      const apiKey = req.headers.authorization as string;
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/upload_text",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: "Failed to process text upload",
    });
  }
};
