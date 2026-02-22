"use client";
import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";

export default function UploadTestPage() {
  const [uploaded, setUploaded] = useState<{
    url: string;
    public_id: string;
  } | null>(null);

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Тест завантаження зображення</h1>

      <ImageUploader onUpload={(result) => setUploaded(result)} />

      {uploaded && (
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm break-all">
          <p>
            <strong>URL:</strong> {uploaded.url}
          </p>
          <p>
            <strong>Public ID:</strong> {uploaded.public_id}
          </p>
        </div>
      )}
    </div>
  );
}
