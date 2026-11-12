import { type NextFetchEvent, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import * as Sentry from "@sentry/nextjs";

export async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Audit trail: one structured log line per request, including probes that end in a 404
  Sentry.logger.info("request", {
    method: request.method,
    path: request.nextUrl.pathname,
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
  // Send the log line now instead of waiting for the next timed flush
  event.waitUntil(Sentry.flush(2000));

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
