import { useState } from "react";
import { apiFetch } from "@/lib/api";

export interface AnswerZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuestionData {
  id: string; // локальний id для UI
  text: string;
  image_url: string;
  image_public_id: string;
  order: number;
  answer_zones: AnswerZone[];
}

export interface TestData {
  title: string;
  description: string;
  questions: QuestionData[];
}

export function useTests() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTest = async (data: TestData) => {
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch("/tests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const fetchTests = async () => {
    return await apiFetch("/tests/");
  };

  const deleteTest = async (id: string) => {
    return await apiFetch(`/tests/${id}`, { method: "DELETE" });
  };

  const regenerateSlug = async (testId: string) => {
    return await apiFetch(`/tests/${testId}/regenerate-slug`, {
      method: "POST",
    });
  };

  const toggleActive = async (testId: string) => {
    return await apiFetch(`/tests/${testId}/toggle-active`, {
      method: "PATCH",
    });
  };

  return {
    saveTest,
    fetchTests,
    deleteTest,
    regenerateSlug,
    toggleActive,
    saving,
    error,
  };
}
