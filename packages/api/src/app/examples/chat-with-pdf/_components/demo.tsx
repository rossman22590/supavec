"use client";

import { FileUploadForm } from "@/app/dashboard/file-upload-form";
import { useEffect, useState } from "react";
import { FileList } from "./file-list";
import { Chat } from "./chat";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import { Stepper } from "./stepper";

export const Demo = () => {
  const posthog = usePostHog();

  const [doneUploading, setDoneUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [step, setStep] = useState(1);

  useEffect(() => {
    localStorage.removeItem("pdfFileId_demo");
    localStorage.removeItem("pdfFileName_demo");
  }, []);

  useEffect(() => {
    if (doneUploading) {
      setFileId(localStorage.getItem("pdfFileId_demo"));
      setFileName(localStorage.getItem("pdfFileName_demo"));
    }
  }, [doneUploading]);

  const submitFile = async (formData: FormData) => {
    setDoneUploading(false);

    const response = await fetch("/api/examples/upload-file", {
      method: "POST",
      body: formData,
    });

    const responseClone = response.clone();
    const result = await responseClone.json();
    if (!response.ok) {
      toast.error(result.error);
      return { success: false };
    }

    localStorage.setItem("pdfFileId_demo", result.file_id);
    localStorage.setItem("pdfFileName_demo", result.file_name);
    setStep(2);

    posthog.capture(
      "Upload file in Chat with PDF example",
      {},
      { send_instantly: true }
    );

    return response;
  };

  const callBack = () => {
    setDoneUploading(true);
  };

  return (
    <div className="min-w-[400px] w-full p-4 mt-8 max-w-4xl mx-auto pb-24 sm:pb-32">
      <Stepper currentStep={step} />
      {!fileName && (
        <FileUploadForm
          placeholder="Drag 'n' drop a PDF file here (max 20MB), or click to select one"
          submitFile={submitFile}
          callBack={callBack}
        />
      )}
      <div className="relative max-w-xl w-full mx-auto flex flex-col gap-5">
        {fileName && <FileList fileName={fileName} setFileName={setFileName} />}
        {fileName && fileId && <Chat fileId={fileId} setStep={setStep} />}
      </div>
    </div>
  );
};
