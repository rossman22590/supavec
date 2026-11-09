import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Request, Response } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";
import { supabase } from "../utils/supabase";
import { ValidatedChatRequest } from "../middleware/chat/validate-request";
import { google } from "@ai-sdk/google";
import { generateText, pipeDataStreamToResponse, streamText } from "ai";

console.log("[CHAT] Module loaded");

// Google shut down gemini-2.0-flash on 2026-06-01 and has since deprecated
// gemini-2.5-flash and gemini-3.5-flash. gemini-3.6-flash is the current stable
// Flash model. Override with CHAT_MODEL when migrating again.
const CHAT_MODEL = process.env.CHAT_MODEL || "gemini-3.6-flash";

export interface AuthenticatedRequest extends Request {
  apiKey: string;
  userId: string;
}

export const chat = async (req: AuthenticatedRequest, res: Response) => {
  console.log("[CHAT] Request received");

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[CHAT] GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return res.status(503).json({
      success: false,
      error: "Chat is not configured on this server (missing model API key)",
    });
  }

  try {
    const { query, k, file_ids, stream: isStreaming, apiKeyData } = req.body
      .validatedData as ValidatedChatRequest;
    console.log("[CHAT] Processing chat request", {
      query,
      k,
      fileIdsCount: file_ids.length,
      stream: isStreaming,
    });

    console.log("[CHAT] Creating vector store");
    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        model: "text-embedding-3-small",
      }),
      {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
        filter: { file_id: { in: file_ids } },
      },
    );

    console.log("[CHAT] Performing similarity search");
    const similaritySearchResults = await vectorStore.similaritySearch(
      query,
      k,
    );

    const context = similaritySearchResults
      .map((doc) => doc.pageContent)
      .join("\n\n");

    console.log("[CHAT] Generating response with AI");
    const prompt =
      `Based on the following context, please answer the question. If the answer cannot be found in the context, please say so.

Context:
${context}

Question: ${query}`;

    if (isStreaming) {
      pipeDataStreamToResponse(res, {
        execute: async (dataStream) => {
          dataStream.writeData({
            status: "initialized",
            timestamp: Date.now(),
          });

          const result = streamText({
            model: google(CHAT_MODEL),
            prompt,
          });

          console.log("[CHAT] Starting stream response");
          dataStream.writeData({ status: "streaming", timestamp: Date.now() });

          result.mergeIntoDataStream(dataStream);

          await result.consumeStream();
          client.capture({
            distinctId: apiKeyData.profiles.email,
            event: "/chat API Call (streaming)",
          });

          logApiUsageAsync({
            endpoint: "/chat",
            userId: apiKeyData.user_id,
            success: true,
          });

          dataStream.writeData({ status: "completed", timestamp: Date.now() });
        },
        onError: (error) => {
          const message = error instanceof Error
            ? error.message
            : String(error);
          console.error("[CHAT] Streaming error:", error);
          logApiUsageAsync({
            endpoint: "/chat",
            userId: apiKeyData.user_id,
            success: false,
            error: message,
          });
          // Surface the real reason (bad model id, missing/invalid key, quota)
          // instead of a constant string that hides every cause.
          return `Chat model error (${CHAT_MODEL}): ${message}`;
        },
      });

      return;
    }

    // Non-streaming response
    const { text: answer } = await generateText({
      model: google(CHAT_MODEL),
      prompt,
    });

    console.log("[CHAT] Capturing PostHog event");
    client.capture({
      distinctId: apiKeyData.profiles.email,
      event: "/chat API Call",
    });

    // `text` is the field the public docs document; `answer` is kept for
    // existing clients that already read it.
    const apiResponse = {
      success: true,
      text: answer,
      answer,
    };

    console.log("[CHAT] Logging API usage");
    logApiUsageAsync({
      endpoint: "/chat",
      userId: apiKeyData.user_id,
      success: true,
    });

    console.log("[CHAT] Sending successful response");
    return res.status(200).json(apiResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[CHAT] Error in chat endpoint:", error);

    logApiUsageAsync({
      endpoint: "/chat",
      userId: req.userId,
      success: false,
      error: message,
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      // Without this the endpoint reported a retired model, a missing key and
      // a quota error identically, which made the failure undiagnosable from
      // the outside. Set CHAT_ERROR_DETAILS=false to go back to hiding it.
      ...(process.env.CHAT_ERROR_DETAILS === "false"
        ? {}
        : { details: message, model: CHAT_MODEL }),
    });
  }
};
