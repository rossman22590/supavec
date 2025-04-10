"use client";

import { useState } from "react";
import type { Tables } from "@/types/supabase";
import { FileListItem } from "./file-list-item";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function UploadedFilesList({
  files,
  apiKey,
}: {
  files: Tables<"files">[] | null;
  apiKey: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter files based on search query
  const filteredFiles = files?.filter(file => 
    file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );
  
  return (
    <div className="mt-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        
        {files && files.length > 0 && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {files?.length === 0 ? (
        <p className="text-muted-foreground mt-4">
          No files have been uploaded yet.
        </p>
      ) : filteredFiles?.length === 0 ? (
        <p className="text-muted-foreground mt-4">
          No files match your search.
        </p>
      ) : (
        <ul className="space-y-3 mt-4">
          {filteredFiles?.map((file) => (
            <FileListItem key={file.id} file={file} apiKey={apiKey} />
          ))}
        </ul>
      )}
    </div>
  );
}
