import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@supavec/web/src/types/supabase";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface ValidatedRequest extends Request {
  body: {
    validatedData: {
      file_id: string;
      teamId: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiKeyData: any;
    };
  };
}

async function getFileData(fileId: string, teamId: string) {
  const { data: file, error: filesError } = await supabase
    .from("files")
    .select("file_id, storage_path")
    .match({ file_id: fileId, team_id: teamId })
    .is("deleted_at", null)
    .single();

  if (filesError) {
    throw new Error(`Failed to fetch file: ${filesError.message}`);
  }

  if (!file) {
    throw {
      status: 404,
      message: "No file found with the provided ID for this team",
    };
  }

  return file;
}

export const deleteFile = async (req: ValidatedRequest, res: Response) => {
  try {
    const { file_id, teamId, apiKeyData } = req.body.validatedData;
    const file = await getFileData(file_id, teamId);

    // Delete file from storage if storage path exists
    let storageError: string | undefined;
    if (file.storage_path) {
      const { error: deleteError } = await supabase.storage
        .from("user-documents")
        .remove([file.storage_path]);

      if (deleteError) {
        storageError =
          `Failed to delete ${file.storage_path}: ${deleteError.message}`;
      }
    }

    // Soft delete records in files and documents tables
    const now = new Date().toISOString();

    // Update files table with deleted_at
    const { error: filesUpdateError } = await supabase
      .from("files")
      .update({ deleted_at: now })
      .match({ file_id });

    if (filesUpdateError) {
      throw new Error(`Failed to update file: ${filesUpdateError.message}`);
    }

    // Update documents table with deleted_at
    const { error: documentsUpdateError } = await supabase
      .from("documents")
      .update({ deleted_at: now })
      .filter("metadata->>file_id", "eq", file_id);

    if (documentsUpdateError) {
      throw new Error(
        `Failed to update documents: ${documentsUpdateError.message}`,
      );
    }

    client.capture({
      distinctId: apiKeyData.profiles?.email as string,
      event: "/delete_file API Call",
    });

    logApiUsageAsync({
      endpoint: "/delete_file",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    return res.json({
      success: true,
      message: "File marked as deleted successfully",
      deleted_file_id: file_id,
      storage_error: storageError,
    });
  } catch (error: unknown) {
    console.error("Error deleting file:", error);

    if (req.headers.authorization) {
      const apiKey = req.headers.authorization as string;
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/delete_file",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const customError = error as Error;
    const message = customError.message || "Failed to delete file";
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
};
