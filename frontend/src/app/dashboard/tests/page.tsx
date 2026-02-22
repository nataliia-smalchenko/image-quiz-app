"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTests } from "@/hooks/useTests";

interface Test {
  id: string;
  title: string;
  description: string;
  slug: string;
  created_at: string;
}

export default function TestsPage() {
  const { fetchTests, deleteTest } = useTests();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests().then((data) => {
      setTests(data || []);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити тест?")) return;
    await deleteTest(id);
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <div className="p-8">Завантаження...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мої тести</h1>
        <Link
          href="/dashboard/tests/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Новий тест
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Тестів ще немає</p>
          <Link
            href="/dashboard/tests/new"
            className="text-blue-500 hover:underline"
          >
            Створити перший тест
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex items-center justify-between"
            >
              <div>
                <h2 className="font-semibold">{test.title}</h2>
                {test.description && (
                  <p className="text-sm text-gray-500">{test.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(test.created_at).toLocaleDateString("uk-UA")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/tests/${test.id}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Деталі
                </Link>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="px-3 py-1 text-sm border border-red-300 
                             text-red-500 rounded hover:bg-red-50"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
