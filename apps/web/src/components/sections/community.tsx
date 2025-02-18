"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Ripple } from "@/components/ui/ripple";
import { siteConfig } from "@/lib/config";

const contributors = [
  {
    name: "Charlie Davis",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    name: "Marie Otaki",
    avatar: "https://avatars.githubusercontent.com/u/33252783?v=4",
  },
  {
    name: "Diana Evans",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    name: "Magio",
    avatar: "https://avatars.githubusercontent.com/u/981372?v=4",
  },
  {
    name: "Taishi kato",
    avatar: "https://avatars.githubusercontent.com/u/980588?v=4",
  },
];

export function Community() {
  return (
    <Section id="community" title="Community">
      <div className="border-x border-t overflow-hidden relative">
        <Ripple />
        <div className="p-6 text-center py-12">
          <p className="text-muted-foreground mb-6 text-balance max-w-prose mx-auto font-medium">
          The AI Tutor RAG API makes it super easy to build powerful AI-driven tutoring experiences
          </p>
          <div className="flex justify-center -space-x-6 mb-8">
            {contributors.map((contributor, index) => (
              <div key={index}>
                <Avatar className="size-12 relative border-2 border-background bg-muted">
                  <AvatarImage
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {contributor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
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
