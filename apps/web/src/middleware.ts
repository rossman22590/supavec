import { NextFetchEvent, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import * as Sentry from "@sentry/nextjs";

async function sendTrackingData(url: string, userAgent: string) {
  try {
    await fetch(
      "https://www.citeanalytics.com/api/track",
      // "http://localhost:3002/api/track",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: process.env.AI_CITATIONS_PROJECT_ID,
          url,
          userAgent,
        }),
      },
    );
    console.log("Successfully sent tracking data");
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Tracking request timed out");
    } else {
      console.error("Failed to send tracking data:", error);
    }
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;

  // Audit trail: one structured log line per request, including probes that end in a 404
  Sentry.logger.info("request", {
    method: request.method,
    path,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown",
    userAgent: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
    // Set on server-action calls, the channel used by the React Server Components exploit
    nextAction: request.headers.get("next-action") ?? "",
    contentType: request.headers.get("content-type") ?? "",
  });

  if (!path.startsWith("/ingest")) {
    const userAgent = request.headers.get("user-agent") || "";
    console.log("Middleware accessed with User-Agent:", userAgent);
    event.waitUntil(sendTrackingData(request.url, userAgent));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
