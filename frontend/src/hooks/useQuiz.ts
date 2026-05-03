"use client";
import { useState, useCallback } from "react";
import { publicFetch } from "@/lib/publicApi";

interface QuizQuestion {
  id: string;
  text: string;
  image_url: string;
  order: number;
}

interface AnswerResult {
  is_correct: boolean;
  tries_count: number;
}

interface AnswerZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QuestionResult {
  question_id: string;
  question_text: string;
  is_correct: boolean;
  tries_count: number;
}

interface QuizResults {
  test_title: string;
  student_name: string;
  total_questions: number;
  correct_count: number;
  started_at: string;
  finished_at: string | null;
  answers: QuestionResult[];
}

type Phase = "loading" | "error" | "name-entry" | "quiz" | "results";

export function useQuiz(slug: string) {
  const [phase, setPhase] = useState<Phase>("name-entry");
  const [error, setError] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [revealedZones, setRevealedZones] = useState<AnswerZone[] | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex] || null;

  const startAttempt = useCallback(
    async (studentName: string) => {
      setError(null);
      setSubmitting(true);
      try {
        const data = await publicFetch(`/tests/public/${slug}/start`, {
          method: "POST",
          body: JSON.stringify({ student_name: studentName }),
        });
        setAttemptId(data.attempt_id);
        setTestTitle(data.test_title);
        setQuestions(data.questions);
        setCurrentIndex(0);
        setPhase("quiz");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [slug],
  );

  const submitAnswer = useCallback(
    async (clickX: number, clickY: number) => {
      if (!attemptId || !currentQuestion) return;
      setSubmitting(true);
      setError(null);
      try {
        const data = await publicFetch(`/attempts/${attemptId}/answer`, {
          method: "POST",
          body: JSON.stringify({
            question_id: currentQuestion.id,
            click_x: clickX,
            click_y: clickY,
          }),
        });
        setLastAnswer(data);
        setRevealedZones(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [attemptId, currentQuestion],
  );

  const revealAnswer = useCallback(async () => {
    if (!attemptId || !currentQuestion) return;
    try {
      const data = await publicFetch(
        `/attempts/${attemptId}/answer/${currentQuestion.id}/reveal`,
        { method: "POST" },
      );
      setRevealedZones(data.correct_zones);
    } catch (err: any) {
      setError(err.message);
    }
  }, [attemptId, currentQuestion]);

  const retryAnswer = useCallback(() => {
    setLastAnswer(null);
    setRevealedZones(null);
  }, []);

  const nextQuestion = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setLastAnswer(null);
      setRevealedZones(null);
    } else {
      // Остання відповідь — завершуємо
      await finishQuiz();
    }
  }, [currentIndex, questions.length, attemptId]);

  const finishQuiz = useCallback(async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const data = await publicFetch(`/attempts/${attemptId}/finish`, {
        method: "POST",
      });
      setResults(data);
      setPhase("results");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [attemptId]);

  return {
    phase,
    error,
    testTitle,
    questions,
    currentQuestion,
    currentIndex,
    lastAnswer,
    revealedZones,
    results,
    submitting,
    startAttempt,
    submitAnswer,
    revealAnswer,
    retryAnswer,
    nextQuestion,
  };
}
