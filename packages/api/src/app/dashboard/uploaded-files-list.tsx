"use client";

import type { Tables } from "@/types/supabase";
import { FileListItem } from "./file-list-item";

export function UploadedFilesList({
  files,
  apiKey,
}: {
  files: Tables<"files">[] | null;
  apiKey: string;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
      {files?.length === 0 ? (
        <p className="text-muted-foreground">
          No files have been uploaded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {files?.map((file) => (
            <FileListItem key={file.id} file={file} apiKey={apiKey} />
          ))}
        </ul>
      )}
    </div>
  );
}
