import { type Message, createDataStreamResponse, streamText } from "ai";
import { getMostRecentUserMessage } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/utils/supabase/server";
import { canMakeApiCall, logApiCall } from "@/lib/api-limit-checker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Get the user to check limits
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Check if user can make API calls (accounting for overrides)
  const apiAccess = await canMakeApiCall(user.id);
  if (!apiAccess.canProceed) {
    return new Response(apiAccess.reason || "API call limit reached", { status: 429 });
  }

  const {
    messages,
    selectedFile,
    apiKey,
  }: {
    messages: Array<Message>;
    selectedFile: string;
    apiKey: string;
  } = await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Call supavec search API
  const searchResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: userMessage.content,
        file_ids: [selectedFile],
      }),
    }
  );

  if (!searchResponse.ok) {
    const errorData = await searchResponse.json();
    console.error("Search API error:", errorData);
    return new Response("Failed to search documents", {
      status: searchResponse.status,
    });
  }

  // Log API usage (only if we get here successfully)
  await logApiCall(user.id, "chat");

  const searchResults = await searchResponse.json();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a helpful assistant that can answer questions and help with tasks.\n\nRelevant context from the document:\n" +
          searchResults.documents
            .map((doc: { content: string }) => doc.content)
            .join("\n"),
        messages,
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return "Oops, an error occured!";
    },
  });
}
