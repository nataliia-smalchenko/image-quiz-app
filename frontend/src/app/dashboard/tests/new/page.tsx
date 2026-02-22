"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useTests, QuestionData } from "@/hooks/useTests";
import QuestionEditor from "@/components/QuestionEditor";

const emptyQuestion = (): QuestionData => ({
  id: uuidv4(),
  text: "",
  image_url: "",
  image_public_id: "",
  order: 0,
  answer_zones: [],
});

export default function NewTestPage() {
  const router = useRouter();
  const { saveTest, saving, error } = useTests();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([emptyQuestion()]);

  const updateQuestion = (index: number, updated: QuestionData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [
      newQuestions[swapIndex],
      newQuestions[index],
    ];
    setQuestions(newQuestions);
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Введіть назву тесту";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Питання ${i + 1}: введіть текст`;
      if (!q.image_url) return `Питання ${i + 1}: завантажте зображення`;
      if (q.answer_zones.length === 0)
        return `Питання ${i + 1}: позначте хоча б одну зону`;
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      alert(validationError);
      return;
    }

    const result = await saveTest({
      title,
      description,
      questions: questions.map((q, i) => ({ ...q, order: i })),
    });

    if (result) {
      router.push(`/dashboard/tests/${result.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Новий тест</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Назад
        </button>
      </div>

      {/* Main information */}
      <div className="border rounded-xl p-6 space-y-4 bg-white shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Назва тесту *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Наприклад: Анатомія людини"
            className="w-full border rounded-lg p-2 focus:outline-none 
                       focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Опис (необов'язково)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Короткий опис тесту"
            rows={2}
            className="w-full border rounded-lg p-2 focus:outline-none 
                       focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            total={questions.length}
            onChange={(updated) => updateQuestion(index, updated)}
            onRemove={() => removeQuestion(index)}
            onMoveUp={() => moveQuestion(index, "up")}
            onMoveDown={() => moveQuestion(index, "down")}
          />
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                   text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
      >
        + Додати питання
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium
                     hover:bg-blue-600 disabled:opacity-50 transition"
        >
          {saving ? "Збереження..." : "Зберегти тест"}
        </button>
      </div>
    </div>
  );
}
