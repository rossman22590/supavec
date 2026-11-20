/**
 * Sentry for the browser. Next loads this file before the app hydrates.
 * Records a replay of every session and forwards console warnings and errors as Sentry logs. Replays show
 * page text and images but mask everything people type, since inputs can contain passwords and keys.
 */
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.shared";

Sentry.init({
  ...sentryOptions,
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
