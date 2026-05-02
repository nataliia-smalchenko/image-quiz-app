"use client";
import { useState } from "react";
import { useTests } from "@/hooks/useTests";

interface Props {
  testId: string;
  slug: string;
  isActive: boolean;
  onSlugChange: (newSlug: string) => void;
  onActiveChange: (isActive: boolean) => void;
}

export default function TestLinkManager({
  testId,
  slug,
  isActive,
  onSlugChange,
  onActiveChange,
}: Props) {
  const { regenerateSlug, toggleActive } = useTests();
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [toggling, setToggling] = useState(false);

  const testUrl = `${window.location.origin}/quiz/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testUrl);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm("Стара посилання перестане працювати. Продовжити?")) return;
    setRegenerating(true);
    const result = await regenerateSlug(testId);
    if (result?.slug) onSlugChange(result.slug);
    setRegenerating(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    const result = await toggleActive(testId);
    if (result !== null) onActiveChange(result.is_active);
    setToggling(false);
  };

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Посилання для учнів</h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium
            ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "● Активне" : "○ Неактивне"}
          </span>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="text-xs text-gray-500 hover:underline disabled:opacity-50"
          >
            {toggling ? "..." : isActive ? "Деактивувати" : "Активувати"}
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          ⚠️ Тест деактивовано — учні не зможуть перейти за посиланням
        </div>
      )}

      <div className="flex gap-2">
        <input
          readOnly
          value={testUrl}
          className={`flex-1 border rounded-lg p-2 text-sm bg-gray-50
            ${!isActive ? "opacity-50" : ""}`}
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 text-sm min-w-[100px] transition"
        >
          {copying ? "✓ Скопійовано" : "Копіювати"}
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">
          Slug: <code className="bg-gray-100 px-1 rounded">{slug}</code>
        </p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs text-gray-400 hover:text-gray-600 
                     hover:underline disabled:opacity-50"
        >
          {regenerating ? "Генерація..." : "↻ Згенерувати нове посилання"}
        </button>
      </div>

      {/* QR код — через зовнішній сервіс */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-2">QR-код для роздруківки:</p>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(testUrl)}`}
          alt="QR код"
          className={`rounded border ${!isActive ? "opacity-40 grayscale" : ""}`}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
}
