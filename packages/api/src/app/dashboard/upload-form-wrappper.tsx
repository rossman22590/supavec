"use client";

import { FileUploadForm } from "./file-upload-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const UploadFormWrapper = ({ apiKey }: { apiKey: string }) => {
  const submitFile = async (formData: FormData) => {
    const response = await fetch(`${API_URL}/upload_file`, {
      method: "POST",
      headers: {
        authorization: apiKey,
      },
      body: formData,
    });

    return response;
  };

  return <FileUploadForm submitFile={submitFile} />;
};
