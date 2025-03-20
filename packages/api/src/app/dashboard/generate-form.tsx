"use client";

import { generateApiKey } from "./actions";
import { GenerateButton } from "./generate-button";
import { usePostHog } from "posthog-js/react";

export const GenerateForm = () => {
  const posthog = usePostHog();

  return (
    <form
      action={async () => {
        await generateApiKey();
        posthog.capture("api_key_generated");
      }}
      className="mt-2"
    >
      <GenerateButton />
    </form>
  );
};
