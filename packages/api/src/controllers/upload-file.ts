import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { z } from "zod";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { updateLoopsContact } from "../utils/loops";
import type { Database } from "@supavec/web/src/types/supabase";
import { client } from "../utils/posthog";

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const uploadQuerySchema = z.object({
  chunk_size: z.coerce.number().positive().nullish(),
  chunk_overlap: z.coerce.number().positive().nullish(),
});

// Sanitize text to handle unsupported Unicode escape sequences from PDFs.
// This version escapes every backslash so that any sequence like "\u..." is safely passed.
function sanitizeText(text: string): string {
  return text.replace(/\\/g, '\\\\');
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
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

    // Validate query parameters
    const queryValidation = uploadQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: queryValidation.error.errors,
      });
    }
    const { chunk_size, chunk_overlap } = queryValidation.data;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const buffer = req.file.buffer;
    const fileId = randomUUID();
    const isTextFile = req.file.mimetype === "text/plain";
    const fileExtension = isTextFile ? "txt" : "pdf";
    const fileName = req.file.originalname;
    const tempFileName = `${fileId}.${fileExtension}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    // Upload file to Supabase Storage with team ID in path
    const { data: storageData, error: storageError } = await supabase.storage
      .from("user-documents")
      .upload(`/${teamId}/${tempFileName}`, buffer, {
        contentType: isTextFile ? "text/plain" : "application/pdf",
        upsert: false,
      });

    if (storageError) {
      throw new Error(
        `Failed to upload file to storage: ${storageError.message}`
      );
    }

    let documents: Document[];
    if (isTextFile) {
      // For text files, create a single document from the content
      const textContent = buffer.toString("utf-8");
      documents = [
        new Document({
          pageContent: textContent,
          metadata: { source: tempFileName },
        }),
      ];
    } else {
      // For PDFs, use the PDFLoader
      const loader = new PDFLoader(tempFilePath);
      documents = await loader.load();
    }

    // Clean up temp file
    await unlink(tempFilePath);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
      chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
    });
    let chunks = await splitter.splitDocuments(documents);

    // Sanitize each chunk's pageContent and add file metadata.
    chunks = chunks.map((chunk) => {
      chunk.pageContent = sanitizeText(chunk.pageContent);
      chunk.metadata.file_id = fileId;
      chunk.metadata.team_id = teamId;
      return chunk;
    });

    // Create embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    try {
      await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
        client: supabase,
        tableName: "documents",
      });

      await supabase.from("files").insert({
        file_id: fileId,
        type: `${isTextFile ? "text" : "pdf"}`,
        file_name: fileName,
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
        event: "file_upload_completed",
        properties: {
          file_name: fileName,
          file_type: isTextFile ? "text" : "pdf",
          file_size: buffer.length,
        },
      });

      return res.json({
        success: true,
        message: `${isTextFile ? "Text" : "PDF"} file processed successfully`,
        file_name: fileName,
        file_id: fileId,
        chunks: chunks.length,
        chunk_size: chunk_size ?? DEFAULT_CHUNK_SIZE,
        chunk_overlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
      });
    } catch (vectorError) {
      throw new Error(
        vectorError instanceof Error
          ? vectorError.message
          : "Error processing vectors"
      );
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to process file${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};


// import { Request, Response } from "express";
// import { createClient } from "@supabase/supabase-js";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { unlink, writeFile } from "fs/promises";
// import { join } from "path";
// import { tmpdir } from "os";
// import { randomUUID } from "crypto";
// import { z } from "zod";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { Document } from "@langchain/core/documents";
// import { updateLoopsContact } from "../utils/loops";
// import type { Database } from "@supavec/web/src/types/supabase";
// import { client } from "../utils/posthog";

// const DEFAULT_CHUNK_SIZE = 1000;
// const DEFAULT_CHUNK_OVERLAP = 200;

// const supabase = createClient<Database>(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!,
// );

// const uploadQuerySchema = z.object({
//   chunk_size: z.coerce.number().positive().nullish(),
//   chunk_overlap: z.coerce.number().positive().nullish(),
// });

// export const uploadFile = async (req: Request, res: Response) => {
//   try {
//     const apiKey = req.headers.authorization as string;

//     // Get team ID from API key
//     const { data: apiKeyData, error: apiKeyError } = await supabase
//       .from("api_keys")
//       .select("team_id, user_id, profiles(email)")
//       .match({ api_key: apiKey })
//       .single();

//     if (apiKeyError || !apiKeyData?.team_id) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid API key",
//       });
//     }

//     const teamId = apiKeyData.team_id as string;

//     // Validate query parameters
//     const queryValidation = uploadQuerySchema.safeParse(req.query);
//     if (!queryValidation.success) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid query parameters",
//         details: queryValidation.error.errors,
//       });
//     }
//     const { chunk_size, chunk_overlap } = queryValidation.data;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "No file provided",
//       });
//     }

//     const buffer = req.file.buffer;
//     const fileId = randomUUID();
//     const isTextFile = req.file.mimetype === "text/plain";
//     const fileExtension = isTextFile ? "txt" : "pdf";
//     const fileName = req.file.originalname;
//     const tempFileName = `${fileId}.${fileExtension}`;
//     const tempFilePath = join(tmpdir(), tempFileName);
//     await writeFile(tempFilePath, buffer);

//     // Upload file to Supabase Storage with team ID in path
//     const { data: storageData, error: storageError } = await supabase.storage
//       .from("user-documents")
//       .upload(`/${teamId}/${tempFileName}`, buffer, {
//         contentType: isTextFile ? "text/plain" : "application/pdf",
//         upsert: false,
//       });

//     if (storageError) {
//       throw new Error(
//         `Failed to upload file to storage: ${storageError.message}`,
//       );
//     }

//     let documents: Document[];
//     if (isTextFile) {
//       // For text files, create a single document from the content
//       const textContent = buffer.toString("utf-8");
//       documents = [
//         new Document({
//           pageContent: textContent,
//           metadata: { source: tempFileName },
//         }),
//       ];
//     } else {
//       // For PDFs, use the PDFLoader
//       const loader = new PDFLoader(tempFilePath);
//       documents = await loader.load();
//     }

//     // Clean up temp file
//     await unlink(tempFilePath);

//     // Split text into chunks
//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
//       chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
//     });
//     const chunks = await splitter.splitDocuments(documents);

//     // Add file_id metadata to each chunk
//     chunks.forEach((chunk) => {
//       chunk.metadata.file_id = fileId;
//       chunk.metadata.team_id = teamId;
//     });

//     // Create embeddings
//     const embeddings = new OpenAIEmbeddings({
//       modelName: "text-embedding-3-small",
//       model: "text-embedding-3-small",
//     });

//     try {
//       await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
//         client: supabase,
//         tableName: "documents",
//       });

//       await supabase.from("files").insert({
//         file_id: fileId,
//         type: `${isTextFile ? "text" : "pdf"}`,
//         file_name: fileName,
//         team_id: teamId,
//         storage_path: storageData.path,
//       });

//       // Update Loops contact
//       if (apiKeyData.profiles?.email) {
//         try {
//           updateLoopsContact({
//             email: apiKeyData.profiles.email,
//             isFileUploaded: true,
//           });
//         } catch (error) {
//           console.error("Error updating Loops contact:", error);
//         }
//       }

//       client.capture({
//         distinctId: apiKeyData.profiles?.email as string,
//         event: "file_upload_completed",
//         properties: {
//           file_name: fileName,
//           file_type: isTextFile ? "text" : "pdf",
//           file_size: buffer.length,
//         },
//       });

//       return res.json({
//         success: true,
//         message: `${isTextFile ? "Text" : "PDF"} file processed successfully`,
//         file_name: fileName,
//         file_id: fileId,
//         chunks: chunks.length,
//         chunk_size: chunk_size ?? DEFAULT_CHUNK_SIZE,
//         chunk_overlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
//       });
//     } catch (vectorError) {
//       throw new Error(
//         vectorError instanceof Error
//           ? vectorError.message
//           : "Error processing vectors",
//       );
//     }
//   } catch (error) {
//     console.error("Error processing file:", error);
//     return res.status(500).json({
//       success: false,
//       error: `Failed to process file${
//         error instanceof Error ? `: ${error.message}` : ""
//       }`,
//     });
//   }
// };
