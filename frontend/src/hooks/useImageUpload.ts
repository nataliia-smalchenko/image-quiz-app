import { useState } from "react";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UploadResult {
  url: string;
  public_id: string;
  width: number;
  height: number;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const session = await getSession();

      const token = (session as any)?.token;
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Session:", session);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/images/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Помилка завантаження");
      }

      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
