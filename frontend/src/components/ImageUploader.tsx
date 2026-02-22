"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Props {
  onUpload: (result: { url: string; public_id: string }) => void;
}

export default function ImageUploader({ onUpload }: Props) {
  const { upload, uploading, error } = useImageUpload();
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const result = await upload(file);
      if (result) {
        onUpload(result);
      }
    },
    [upload, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-500">Завантаження та обробка...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Відпустіть файл тут</p>
        ) : (
          <div>
            <p className="text-gray-500">Перетягніть зображення або клікніть</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP до 10MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {preview && !uploading && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded border"
          />
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            ✓ Завантажено
          </span>
        </div>
      )}
    </div>
  );
}
