"use client";
import { QuestionData, AnswerZone } from "@/hooks/useTests";
import ImageUploader from "./ImageUploader";
import ZoneDrawer from "./ZoneDrawer";

interface Props {
  question: QuestionData;
  index: number;
  total: number;
  onChange: (updated: QuestionData) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <div className="border rounded-xl p-6 space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Питання {index + 1}</h3>
        <div className="flex gap-2">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-1 text-sm border border-red-300 text-red-500 
                       rounded hover:bg-red-50"
          >
            Видалити
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Текст питання
        </label>
        <input
          type="text"
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Наприклад: Вкажіть на серце людини"
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 
                     focus:ring-blue-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Зображення
        </label>
        {question.image_url ? (
          <div className="space-y-3">
            <ZoneDrawer
              imageUrl={question.image_url}
              zones={question.answer_zones}
              onChange={(zones: AnswerZone[]) =>
                onChange({ ...question, answer_zones: zones })
              }
            />
            <button
              onClick={() =>
                onChange({
                  ...question,
                  image_url: "",
                  image_public_id: "",
                  answer_zones: [],
                })
              }
              className="text-xs text-gray-500 hover:underline"
            >
              Замінити зображення
            </button>
          </div>
        ) : (
          <ImageUploader
            onUpload={(result) =>
              onChange({
                ...question,
                image_url: result.url,
                image_public_id: result.public_id,
                answer_zones: [],
              })
            }
          />
        )}
      </div>
    </div>
  );
}
