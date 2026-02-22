"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function TestDetailPage() {
  const { id } = useParams();
  const [test, setTest] = useState<any>(null);

  useEffect(() => {
    apiFetch(`/tests/${id}`).then(setTest);
  }, [id]);

  if (!test) return <div className="p-8">Завантаження...</div>;

  const testUrl = `${window.location.origin}/quiz/${test.slug}`;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{test.title}</h1>

      <div className="border rounded-xl p-4 bg-blue-50 space-y-2">
        <p className="text-sm font-medium text-blue-700">
          Посилання для учнів:
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={testUrl}
            className="flex-1 border rounded p-2 text-sm bg-white"
          />
          <button
            onClick={() => navigator.clipboard.writeText(testUrl)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Копіювати
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">
          Питання ({test.questions?.length || 0})
        </h2>
        {test.questions?.map((q: any, i: number) => (
          <div
            key={q.id}
            className="border rounded-lg p-3 flex gap-3 items-start"
          >
            <span className="text-gray-400 text-sm">{i + 1}.</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{q.text}</p>
              <p className="text-xs text-gray-400">
                Кількість зон відповіді: {q.answer_zones?.length || 0}
              </p>
            </div>
            <img
              src={q.image_url}
              alt=""
              className="w-20 h-14 object-cover rounded border"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
