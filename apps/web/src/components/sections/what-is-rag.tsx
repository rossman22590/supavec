import { Section } from "@/components/section";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export const WhatIsRag = () => {
  return (
    <Section id="what-is-rag">
      <div className="border overflow-hidden w-full p-6 lg:p-12">
        <h2 className="text-foreground mb-6 text-balance font-medium text-3xl">
          What is RAG?
        </h2>
        <div className="text-muted-foreground text-balance space-y-3">
          <p>
            RAG (Retrieval-Augmented Generation) enhances AI responses by
            combining them with relevant information from your documents.
          </p>
          <p>
            Instead of relying on general AI knowledge alone, RAG searches your
            documents to provide precise, context-aware answers based on your
            specific content.
          </p>
        </div>
        <a
          href="https://support.myapps.ai"
          className={cn(buttonVariants({ variant: "link" }), "px-0 mt-3")}
        >
          Learn more.
        </a>
      </div>
    </Section>
  );
};
