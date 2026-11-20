/**
 * Sentry settings shared by the browser, Node and edge runtimes.
 * This repo is public, so the DSN comes only from the environment: Sentry stays off unless
 * NEXT_PUBLIC_SENTRY_DSN (or SENTRY_DSN on the server) is set, and clones/forks report nowhere.
 */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

export const sentryOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV,
  // Keep every error and every performance trace in all environments.
  sampleRate: 1,
  tracesSampleRate: 1,
};
