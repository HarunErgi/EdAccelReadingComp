export interface PassageSection {
  id: string;
  title: string;
  content: string;
}

export interface Question {
  id: string;
  sectionId: string;
  question: string;
  keyConceptsForEvaluation: string[];
  difficulty: "foundational" | "analytical" | "inferential";
}

export interface EvaluationResult {
  score: "correct" | "partial" | "incorrect";
  assessment: string;
  improvement: string;
}

export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  attempt: number;
  result?: EvaluationResult;
}

export type AppPhase = "welcome" | "reading" | "questions" | "feedback" | "retry" | "complete";
