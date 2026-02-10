"use client";

import { useState, useCallback } from "react";
import { passageTitle, passageSections } from "@/data/passage";
import { questions as fallbackQuestions } from "@/data/questions";
import type { Question, AnswerRecord, AppPhase, EvaluationResult } from "@/lib/types";

export default function ReadingExperience() {
  const [phase, setPhase] = useState<AppPhase>("welcome");
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [inputValue, setInputValue] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [visitedSections, setVisitedSections] = useState<Set<number>>(new Set([0]));

  const currentSection = passageSections[currentSectionIndex];
  const sectionQuestions = questions.filter((q) => q.sectionId === currentSection.id);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  const totalQuestions = questions.length;
  const answeredCount = Object.values(answers).filter((a) => a.result).length;

  const currentAnswer = answers[currentQuestion?.id];

  const handleStartReading = async () => {
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length) {
          setQuestions(data.questions);
        }
      }
    } catch {
      // Fall back to pre-generated questions — already set as default
    } finally {
      setIsGenerating(false);
      setPhase("reading");
    }
  };

  const handleFinishedReading = () => {
    setCurrentQuestionIndex(0);
    setPhase("questions");
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!inputValue.trim() || isEvaluating) return;

    const attempt = phase === "retry" ? 2 : 1;
    const previousAnswer = phase === "retry" ? currentAnswer?.userAnswer : undefined;

    setIsEvaluating(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: inputValue,
          keyConcepts: currentQuestion.keyConceptsForEvaluation,
          sectionContent: currentSection.content,
          attempt,
          previousAnswer,
        }),
      });

      const result: EvaluationResult = await res.json();

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          userAnswer: inputValue,
          attempt,
          result,
        },
      }));
      setPhase("feedback");
    } catch {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          userAnswer: inputValue,
          attempt,
          result: {
            score: "partial",
            assessment: "We couldn't evaluate your answer right now.",
            improvement: "Keep going — you're doing great!",
          },
        },
      }));
      setPhase("feedback");
    } finally {
      setIsEvaluating(false);
    }
  }, [inputValue, isEvaluating, currentQuestion, currentSection.content, phase, currentAnswer]);

  const handleTryAgain = () => {
    setInputValue("");
    setPhase("retry");
  };

  const handleNextQuestion = () => {
    setInputValue("");
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setPhase("questions");
    } else if (currentSectionIndex < passageSections.length - 1) {
      setCurrentSectionIndex((i) => i + 1);
      setVisitedSections((prev) => new Set(prev).add(currentSectionIndex + 1));
      setCurrentQuestionIndex(0);
      setPhase("reading");
    } else {
      setPhase("complete");
    }
  };

  const handleJumpToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setVisitedSections((prev) => new Set(prev).add(index));
    setPhase("reading");
  };

  const handleRestart = () => {
    setPhase("welcome");
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setInputValue("");
    setVisitedSections(new Set([0]));
  };

  const fontSizeClass = {
    base: "text-base leading-7",
    lg: "text-lg leading-8",
    xl: "text-xl leading-9",
  }[fontSize];

  // Score calculation
  const scoreData = Object.values(answers).reduce(
    (acc, a) => {
      if (a.result?.score === "correct") acc.correct++;
      else if (a.result?.score === "partial") acc.partial++;
      else acc.incorrect++;
      return acc;
    },
    { correct: 0, partial: 0, incorrect: 0 }
  );

  // --- Welcome Screen ---
  if (phase === "welcome") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="mb-6 text-5xl">🐝</div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">{passageTitle}</h1>
          <p className="mb-2 text-gray-600">
            Read through the passage section by section, then answer comprehension questions.
          </p>
          <p className="mb-8 text-sm text-gray-400">
            {passageSections.length} sections &middot; AI-generated questions &middot; ~5 min
          </p>

          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Text size:</span>
            {(["base", "lg", "xl"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`rounded-md px-3 py-1 transition ${
                  fontSize === size
                    ? "bg-amber-100 text-amber-800 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {size === "base" ? "A" : size === "lg" ? "A+" : "A++"}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartReading}
            disabled={isGenerating}
            className="rounded-xl bg-amber-500 px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating questions...
              </span>
            ) : (
              "Start Reading"
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- Complete Screen ---
  if (phase === "complete") {
    const percentage = Math.round(
      ((scoreData.correct + scoreData.partial * 0.5) / totalQuestions) * 100
    );

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="mb-6 text-5xl">{percentage >= 70 ? "🎉" : percentage >= 40 ? "💪" : "📖"}</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Reading Complete!</h2>
          <p className="mb-6 text-gray-600">{passageTitle}</p>

          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 text-4xl font-bold text-amber-600">{percentage}%</div>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <div className="text-2xl font-bold text-green-600">{scoreData.correct}</div>
                <div className="text-gray-500">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{scoreData.partial}</div>
                <div className="text-gray-500">Partial</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{scoreData.incorrect}</div>
                <div className="text-gray-500">Incorrect</div>
              </div>
            </div>
          </div>

          {/* Answer review */}
          <div className="mb-8 space-y-4 text-left">
            <h3 className="font-semibold text-gray-700">Your Answers</h3>
            {questions.map((q) => {
              const answer = answers[q.id];
              const scoreColor = {
                correct: "border-green-200 bg-green-50",
                partial: "border-amber-200 bg-amber-50",
                incorrect: "border-red-200 bg-red-50",
              }[answer?.result?.score ?? "incorrect"];

              return (
                <div key={q.id} className={`rounded-lg border p-4 ${scoreColor}`}>
                  <p className="mb-2 text-sm font-medium text-gray-700">{q.question}</p>
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Your answer:</span> {answer?.userAnswer}
                    {answer?.attempt === 2 && (
                      <span className="ml-2 text-xs text-gray-400">(2nd attempt)</span>
                    )}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md bg-white/60 p-2">
                      <p className="mb-0.5 text-xs font-semibold uppercase text-gray-400">Assessment</p>
                      <p className="text-sm text-gray-600">{answer?.result?.assessment}</p>
                    </div>
                    <div className="rounded-md bg-white/60 p-2">
                      <p className="mb-0.5 text-xs font-semibold uppercase text-gray-400">Improvement</p>
                      <p className="text-sm text-gray-600">{answer?.result?.improvement}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.98]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Reading & Questions Flow ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top progress bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-500">
            {passageTitle}
          </span>
          <span className="text-sm text-gray-400">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-amber-400 transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Section navigation */}
        <div className="mb-6 flex gap-2">
          {passageSections.map((section, i) => {
            const sectionQs = questions.filter((q) => q.sectionId === section.id);
            const allAnswered = sectionQs.every((q) => answers[q.id]?.result);
            const isCurrent = i === currentSectionIndex;

            return (
              <button
                key={section.id}
                onClick={() => handleJumpToSection(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                  isCurrent
                    ? "bg-amber-100 text-amber-800 font-medium"
                    : allAnswered
                      ? "bg-green-50 text-green-700"
                      : visitedSections.has(i)
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gray-50 text-gray-400"
                }`}
              >
                {allAnswered && <span className="text-green-500">✓</span>}
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Passage section */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-600">
            Section {currentSectionIndex + 1} of {passageSections.length}
          </h2>
          <h3 className="mb-4 text-xl font-bold text-gray-900">{currentSection.title}</h3>
          <p className={`text-gray-700 ${fontSizeClass}`}>{currentSection.content}</p>

          {phase === "reading" && (
            <button
              onClick={handleFinishedReading}
              className="mt-6 rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white transition hover:bg-amber-600 active:scale-[0.98]"
            >
              I&apos;ve finished reading
            </button>
          )}
        </div>

        {/* Question area */}
        {(phase === "questions" || phase === "feedback" || phase === "retry") && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="mb-1 text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {sectionQuestions.length}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">
                {currentQuestion.difficulty}
              </span>
              {phase === "retry" && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  2nd attempt
                </span>
              )}
            </div>

            <p className="mb-4 text-lg font-medium text-gray-900">{currentQuestion.question}</p>

            {/* Input area — shown for first attempt and retry */}
            {(phase === "questions" || phase === "retry") && (
              <>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    phase === "retry"
                      ? "Use the feedback above to improve your answer..."
                      : "Type your answer here..."
                  }
                  rows={3}
                  className="mb-4 w-full rounded-lg border border-gray-200 p-3 text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSubmitAnswer();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">⌘+Enter to submit</span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!inputValue.trim() || isEvaluating}
                    className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isEvaluating ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Checking...
                      </span>
                    ) : phase === "retry" ? (
                      "Submit Improved Answer"
                    ) : (
                      "Submit Answer"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Feedback panels */}
            {phase === "feedback" && currentAnswer?.result && (
              <div>
                {/* Score badge */}
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      {
                        correct: "bg-green-100 text-green-800",
                        partial: "bg-amber-100 text-amber-800",
                        incorrect: "bg-red-100 text-red-800",
                      }[currentAnswer.result.score]
                    }`}
                  >
                    {
                      {
                        correct: "✅ Correct",
                        partial: "🔶 Partial",
                        incorrect: "💡 Incorrect",
                      }[currentAnswer.result.score]
                    }
                  </span>
                  {currentAnswer.attempt === 2 && (
                    <span className="text-xs text-gray-400">2nd attempt</span>
                  )}
                </div>

                {/* Your answer */}
                <p className="mb-4 text-sm text-gray-500">
                  <span className="font-medium">Your answer:</span>{" "}
                  {currentAnswer.userAnswer}
                </p>

                {/* Two-panel feedback */}
                <div className="mb-6 grid gap-4">
                  {/* Panel 1: Assessment */}
                  <div
                    className={`rounded-lg border p-4 ${
                      {
                        correct: "border-green-200 bg-green-50",
                        partial: "border-amber-200 bg-amber-50",
                        incorrect: "border-red-200 bg-red-50",
                      }[currentAnswer.result.score]
                    }`}
                  >
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Assessment
                    </h4>
                    <p className="text-sm text-gray-700">{currentAnswer.result.assessment}</p>
                  </div>

                  {/* Panel 2: How to improve */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      How to Improve
                    </h4>
                    <p className="text-sm text-gray-700">{currentAnswer.result.improvement}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {currentAnswer.attempt < 2 && currentAnswer.result.score !== "correct" && (
                    <button
                      onClick={handleTryAgain}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-6 py-2.5 font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-[0.98]"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={handleNextQuestion}
                    className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white transition hover:bg-amber-600 active:scale-[0.98]"
                  >
                    {currentQuestionIndex < sectionQuestions.length - 1
                      ? "Next Question"
                      : currentSectionIndex < passageSections.length - 1
                        ? "Next Section"
                        : "See Results"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show first attempt feedback above the retry input */}
        {phase === "retry" && currentAnswer?.result && (
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <h4 className="mb-3 text-sm font-semibold text-gray-500">Feedback from your first attempt</h4>
            <div className="grid gap-4">
              <div
                className={`rounded-lg border p-4 ${
                  {
                    correct: "border-green-200 bg-green-50",
                    partial: "border-amber-200 bg-amber-50",
                    incorrect: "border-red-200 bg-red-50",
                  }[currentAnswer.result.score]
                }`}
              >
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Assessment
                </h4>
                <p className="text-sm text-gray-700">{currentAnswer.result.assessment}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  How to Improve
                </h4>
                <p className="text-sm text-gray-700">{currentAnswer.result.improvement}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
