import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.shared";

Sentry.init({
  ...sentryOptions,
  // Forward everything the server prints (console.log/warn/error) to Sentry Logs
  integrations: [Sentry.consoleLoggingIntegration()],
});
