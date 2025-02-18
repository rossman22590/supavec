"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Ripple } from "@/components/ui/ripple";
import { siteConfig } from "@/lib/config";

export function Community() {
  return (
    <Section id="community" title="RAG API">
      <div className="border-x border-t overflow-hidden relative">
        <Ripple />
        <div className="p-6 text-center py-12">
          <p className="text-muted-foreground mb-6 text-balance max-w-prose mx-auto font-medium">
            The AI Tutor RAG API makes it super easy to build powerful AI-driven tutoring experiences.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              variant="secondary"
              className="flex items-center gap-2"
            >
              <a target="_blank" href={siteConfig.links.github}>
                <Icons.github className="h-5 w-5" />
                Start Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
