/** Sentry for the Node server runtime. Loaded once per server process from instrumentation.ts. */
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.shared";

Sentry.init({
  ...sentryOptions,
  // Attach local variable values to each stack frame of an error.
  includeLocalVariables: true,
  // Forward everything the server prints (console.log/warn/error) to Sentry Logs
  integrations: [Sentry.consoleLoggingIntegration()],
});
