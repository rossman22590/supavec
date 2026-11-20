// Sentry must be initialised before express and the rest of the app are loaded,
// so server.ts imports this file first.
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as Sentry from "@sentry/bun";

// Load .env here too: this file runs before server.ts reads it.
dotenv.config({ path: resolve(__dirname, "../.env") });
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: resolve(__dirname, "../.env.local"), override: true });
}

// This repo is public, so the DSN comes only from the environment: Sentry stays off unless SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  // Coolify sets SOURCE_COMMIT to the deployed commit
  release: process.env.SOURCE_COMMIT || undefined,
  // Keep every error and every performance trace.
  sampleRate: 1,
  tracesSampleRate: 1,
  // Forward everything the server prints to Sentry Logs
  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ["log", "info", "warn", "error"],
    }),
  ],
  // Same Sentry project as the web app; this tag tells the two apart
  initialScope: { tags: { component: "api" } },
});

export { Sentry };
