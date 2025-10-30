"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { SuspendedPostHogPageView } from "./PostHogPageView";

if (typeof window !== "undefined") {
  const isAuthFlow =
    window.location.pathname.startsWith("/login") ||
    window.location.pathname.startsWith("/auth/callback");

  if (!isAuthFlow) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only",
    });
  }
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PostHogProvider>
  );
}
