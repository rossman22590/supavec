"use client";

import { Button } from "@/components/ui/button";
import { X, File } from "lucide-react";
import { useRouter } from "next/navigation";

export const FileList = ({
  fileName,
  setFileName,
}: {
  fileName: string;
  setFileName: (fileName: string | null) => void;
}) => {
  const router = useRouter();

  return (
    <div className="bg-muted-foreground/15 p-2 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <File className="size-5" />
        <span>{fileName}</span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          localStorage.removeItem("pdfFileId_demo");
          localStorage.removeItem("pdfFileName_demo");
          setFileName(null);

          router.refresh();
        }}
      >
        <X />
      </Button>
    </div>
  );
};
