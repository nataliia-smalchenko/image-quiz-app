"use client";
import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuiz } from "@/hooks/useQuiz";

function NameEntryForm({
  testTitle,
  onStart,
  submitting,
  error,
}: {
  testTitle?: string;
  onStart: (name: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow">
        {testTitle && (
          <h1 className="text-2xl font-bold text-center">{testTitle}</h1>
        )}
        <h2 className="text-lg text-gray-600 text-center">
          Введіть ваше прізвище та ім&apos;я
        </h2>

        <input
          type="text"
          placeholder="Прізвище та ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-3 text-lg"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onStart(name.trim());
          }}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={() => onStart(name.trim())}
          disabled={!name.trim() || submitting}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg text-lg
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Завантаження..." : "Почати тест"}
        </button>
      </div>
    </div>
  );
}

// --- Компонент для кліку на зображення ---

function ImageClickArea({
  imageUrl,
  clickPoint,
  revealedZones,
  onImageClick,
}: {
  imageUrl: string;
  clickPoint: { x: number; y: number } | null;
  revealedZones: { x: number; y: number; width: number; height: number }[] | null;
  onImageClick: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onImageClick(x, y);
    },
    [onImageClick],
  );

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-crosshair rounded-lg overflow-hidden border"
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt="Питання"
        className="w-full block pointer-events-none"
        draggable={false}
      />

      {/* Маркер кліку */}
      {clickPoint && (
        <div
          style={{
            position: "absolute",
            left: `${clickPoint.x}%`,
            top: `${clickPoint.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="w-6 h-6 rounded-full border-3 border-blue-500 bg-blue-500/30
                     pointer-events-none z-10"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white" />
        </div>
      )}

      {/* Правильні зони (після reveal) */}
      {revealedZones?.map((zone, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
          }}
          className="border-2 border-green-500 bg-green-500/20 pointer-events-none"
        >
          <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 leading-tight">
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

function QuizRunner({
  quiz,
}: {
  quiz: ReturnType<typeof useQuiz>;
}) {
  const [clickPoint, setClickPoint] = useState<{ x: number; y: number } | null>(null);

  const {
    testTitle,
    questions,
    currentQuestion,
    currentIndex,
    lastAnswer,
    revealedZones,
    submitting,
    error,
    submitAnswer,
    revealAnswer,
    retryAnswer,
    nextQuestion,
  } = quiz;

  if (!currentQuestion) return null;

  const isLastQuestion = currentIndex === questions.length - 1;

  const handleImageClick = (x: number, y: number) => {
    if (lastAnswer) return; // не дозволяємо клікати після перевірки
    setClickPoint({ x, y });
  };

  const handleCheck = async () => {
    if (!clickPoint) return;
    await submitAnswer(clickPoint.x, clickPoint.y);
  };

  const handleRetry = () => {
    retryAnswer();
    setClickPoint(null);
  };

  const handleNext = () => {
    nextQuestion();
    setClickPoint(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {/* Заголовок та прогрес */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{testTitle}</h1>
          <span className="text-sm text-gray-500">
            Питання {currentIndex + 1} з {questions.length}
          </span>
        </div>

        {/* Прогрес-бар */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + (lastAnswer ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Текст питання */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-medium">{currentQuestion.text}</h2>

          {/* Зображення з клікабельною областю */}
          <ImageClickArea
            imageUrl={currentQuestion.image_url}
            clickPoint={clickPoint}
            revealedZones={revealedZones}
            onImageClick={handleImageClick}
          />

          {/* Фідбек */}
          {lastAnswer && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                lastAnswer.is_correct
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {lastAnswer.is_correct
                ? "Правильно!"
                : `Неправильно (спроба ${lastAnswer.tries_count})`}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Кнопки */}
          <div className="flex gap-3">
            {!lastAnswer && (
              <button
                onClick={handleCheck}
                disabled={!clickPoint || submitting}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg
                           hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Перевірка..." : "Перевірити"}
              </button>
            )}

            {lastAnswer && !lastAnswer.is_correct && !revealedZones && (
              <>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg
                             hover:bg-amber-600"
                >
                  Спробувати ще
                </button>
                <button
                  onClick={revealAnswer}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg
                             hover:bg-gray-50"
                >
                  Показати відповідь
                </button>
              </>
            )}

            {lastAnswer && (lastAnswer.is_correct || revealedZones) && (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg
                           hover:bg-green-600 disabled:opacity-50"
              >
                {submitting
                  ? "Завершення..."
                  : isLastQuestion
                    ? "Завершити тест"
                    : "Далі"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsSummary({
  results,
}: {
  results: NonNullable<ReturnType<typeof useQuiz>["results"]>;
}) {
  const percentage = Math.round(
    (results.correct_count / results.total_questions) * 100,
  );

  const duration =
    results.started_at && results.finished_at
      ? Math.round(
          (new Date(results.finished_at).getTime() -
            new Date(results.started_at).getTime()) /
            1000,
        )
      : null;

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min} хв ${sec} с` : `${sec} с`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6">
      <div className="w-full max-w-lg mx-auto px-4 space-y-6">
        <div className="bg-white rounded-xl shadow p-8 space-y-6 text-center">
          <h1 className="text-2xl font-bold">{results.test_title}</h1>
          <p className="text-gray-500">{results.student_name}</p>

          {/* Результат */}
          <div className="space-y-2">
            <div
              className={`text-5xl font-bold ${
                percentage >= 70
                  ? "text-green-500"
                  : percentage >= 40
                    ? "text-amber-500"
                    : "text-red-500"
              }`}
            >
              {percentage}%
            </div>
            <p className="text-gray-600">
              {results.correct_count} з {results.total_questions} правильних
            </p>
            {duration !== null && (
              <p className="text-sm text-gray-400">
                Час: {formatDuration(duration)}
              </p>
            )}
          </div>

          {/* Деталі по питаннях */}
          <div className="space-y-2 text-left">
            <h3 className="font-semibold text-gray-700">Деталі:</h3>
            {results.answers.map((a, i) => (
              <div
                key={a.question_id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 ${
                    a.is_correct ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm truncate">
                  {a.question_text}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {a.tries_count > 1 ? `${a.tries_count} спроб` : "1 спроба"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const quiz = useQuiz(slug);

  if (quiz.phase === "name-entry") {
    return (
      <NameEntryForm
        onStart={quiz.startAttempt}
        submitting={quiz.submitting}
        error={quiz.error}
      />
    );
  }

  if (quiz.phase === "quiz") {
    return <QuizRunner quiz={quiz} />;
  }

  if (quiz.phase === "results" && quiz.results) {
    return <ResultsSummary results={quiz.results} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Завантаження...</p>
    </div>
  );
}
