"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function ContentSubmission({ apiKey }: { apiKey: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (content.length < 5) {
      setError("Content must be at least 5 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/upload_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: apiKey,
        },
        body: JSON.stringify({ name, contents: content }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to submit content");
      }

      setName("");
      setContent("");
      router.refresh();
      toast.success("Content submitted successfully");
    } catch (err) {
      setError("An error occurred while submitting content");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Submit Content</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="content-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content Name:
          </label>
          <Input
            id="content-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for your content (optional)"
          />
        </div>
        <div>
          <label
            htmlFor="content-body"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content:
          </label>
          <Textarea
            id="content-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here... (minimum 5 characters)"
            rows={10}
            required
            minLength={5}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Content"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
