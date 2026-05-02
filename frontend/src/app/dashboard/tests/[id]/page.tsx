"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import TestLinkManager from "@/components/TestLinkManager";

export default function TestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/tests/${id}`)
      .then(setTest)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Завантаження...</div>;
  if (!test) return <div className="p-8 text-red-500">Тест не знайдено</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Шапка */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:underline mb-1 block"
          >
            ← Назад до тестів
          </button>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          {test.description && (
            <p className="text-gray-500 mt-1">{test.description}</p>
          )}
        </div>
        <Link
          href={`/dashboard/tests/${id}/stats`}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          📊 Статистика
        </Link>
      </div>

      {/* Керування посиланням */}
      <TestLinkManager
        testId={test.id}
        slug={test.slug}
        isActive={test.is_active}
        onSlugChange={(newSlug) => setTest({ ...test, slug: newSlug })}
        onActiveChange={(isActive) => setTest({ ...test, is_active: isActive })}
      />

      {/* Список питань */}
      <div className="space-y-2">
        <h2 className="font-semibold text-gray-700">
          Питання ({test.questions?.length || 0})
        </h2>
        {test.questions?.map((q: any, i: number) => (
          <div
            key={q.id}
            className="border rounded-xl p-4 bg-white shadow-sm flex gap-4 items-start"
          >
            <span className="text-gray-300 font-bold text-lg">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{q.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                Правильних зон: {q.answer_zones?.length || 0}
              </p>
            </div>
            <img
              src={q.image_url}
              alt=""
              className="w-24 h-16 object-cover rounded-lg border flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
