import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/env");

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config, { nextRuntime }) => {
    // Avoid bundling Realtime client into Edge runtime (middleware),
    // which triggers Node API warnings and isn’t used there.
    if (nextRuntime === "edge") {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@supabase/realtime-js": path.resolve(
          fileURLToPath(import.meta.url),
          "..",
          "src",
          "shims",
          "empty-realtime.ts"
        ),
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withSentryConfig(withMDX(nextConfig), {
  org: "tsi-36",
  project: "ragapi-v2",
  // Org token from the environment only - this repo is public. Without it the build still works and
  // skips the source map upload.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  // Upload source maps for all client chunks, including Next's own.
  widenClientFileUpload: true,
  // Send browser events through the app so ad-blockers don't drop them.
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
