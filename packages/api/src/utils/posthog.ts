import { PostHog } from "posthog-node";

// Initialize PostHog client only if configured; otherwise, use a no-op client
const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST;

function createNoopClient() {
  return {
    capture: (_event: unknown) => {},
    shutdown: async () => {},
  };
}

export const client: Pick<PostHog, "capture" | "shutdown"> =
  apiKey && host ? new PostHog(apiKey, { host }) : createNoopClient();
