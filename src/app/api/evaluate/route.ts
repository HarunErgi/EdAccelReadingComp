import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    baseURL: "https://api.apifree.ai/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  const { question, userAnswer, keyConcepts, sectionContent, attempt = 1, previousAnswer } = await request.json();

  if (!userAnswer?.trim()) {
    return NextResponse.json({
      score: "incorrect",
      assessment: "No answer was provided.",
      improvement: "Try re-reading the passage and giving it another shot!",
    });
  }

  const openai = getClient();

  const previousContext = attempt > 1 && previousAnswer
    ? `\n\nThis is the student's second attempt. Their first answer was: "${previousAnswer}". Evaluate whether they improved and acknowledge the effort.`
    : "";

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are a friendly, encouraging reading comprehension tutor for students. Evaluate the student's answer to a reading comprehension question.

IMPORTANT: Only evaluate the answer based on the following passage section. Do NOT use outside knowledge. The student has only read this section so far:

"""
${sectionContent}
"""

Key concepts from this section that the answer should cover:
${keyConcepts.map((c: string) => `- ${c}`).join("\n")}

Respond with JSON only, no markdown:
{
  "score": "correct" | "partial" | "incorrect",
  "assessment": "...",
  "improvement": "..."
}

Scoring guide:
- "correct": Covers the main ideas accurately. Doesn't need to be word-perfect.
- "partial": Shows some understanding but misses key points.
- "incorrect": Misunderstands or doesn't address the question.

"assessment": A grade/evaluation of their answer. Acknowledge what they got right or where they went wrong. Be specific about which concepts they nailed. (2-3 sentences max)

"improvement": Actionable guidance on how to strengthen the answer. For correct answers, mention a small detail that could make it even better. For partial/incorrect, point them to the specific part of the passage that holds the key. (2-3 sentences max)

Tone: Warm and encouraging, never clinical. This should feel like a tutor, not a test.${previousContext}`,
      },
      {
        role: "user",
        content: `Question: ${question}\n\nStudent's answer: ${userAnswer}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  try {
    const result = JSON.parse(content);
    return NextResponse.json({
      score: result.score,
      assessment: result.assessment,
      improvement: result.improvement,
    });
  } catch {
    return NextResponse.json({
      score: "partial",
      assessment: "We had trouble evaluating your answer.",
      improvement: "Keep thinking about the details in the passage and try again!",
    });
  }
}
