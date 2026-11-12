// Shared Sentry settings for the browser, Node server and edge runtimes.
// The DSN only identifies where events are sent; it is not a secret.
export const sentryOptions = {
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ??
    "https://99aba1f240986dca35a59906a905881c@o4504625533419520.ingest.us.sentry.io/4512416310558720",
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  // Local development stays quiet unless explicitly switched on
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_SENTRY_ENABLED === "1",
  // Record every request as a trace, not a sample
  tracesSampleRate: 1,
};
