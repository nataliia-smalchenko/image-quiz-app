"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface AttemptSummary {
  id: string;
  student_name: string;
  started_at: string;
  finished_at: string | null;
  correct_count: number;
  total_questions: number;
}

interface TestStats {
  test_title: string;
  total_attempts: number;
  attempts: AttemptSummary[];
}

export default function TestStatsPage() {
  const { id } = useParams();
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/tests/${id}/stats`)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="p-8 text-gray-400">Завантаження...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!stats) return <div className="p-8 text-red-500">Дані не знайдено</div>;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "—";
    const seconds = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 1000,
    );
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min} хв ${sec} с` : `${sec} с`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Шапка */}
      <div>
        <Link
          href={`/dashboard/tests/${id}`}
          className="text-sm text-gray-400 hover:underline mb-1 block"
        >
          &larr; Назад до тесту
        </Link>
        <h1 className="text-2xl font-bold">{stats.test_title}</h1>
        <p className="text-gray-500 mt-1">
          Всього спроб: {stats.total_attempts}
        </p>
      </div>

      {/* Таблиця */}
      {stats.attempts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          Ще ніхто не проходив цей тест
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  Учень
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  Дата
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  Результат
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  Час
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.attempts.map((a) => {
                const percent =
                  a.total_questions > 0
                    ? Math.round((a.correct_count / a.total_questions) * 100)
                    : 0;
                return (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {a.student_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(a.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          percent >= 70
                            ? "text-green-600"
                            : percent >= 40
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {a.correct_count}/{a.total_questions} ({percent}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDuration(a.started_at, a.finished_at)}
                    </td>
                    <td className="px-4 py-3">
                      {a.finished_at ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Завершено
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                          В процесі
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
