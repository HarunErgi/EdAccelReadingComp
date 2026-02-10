/**
 * Build-time script to generate comprehension questions from the passage using OpenRouter.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-... npx tsx scripts/generate-questions.ts
 *
 * Output is printed to stdout as a TypeScript array you can paste into src/data/questions.ts
 */

import OpenAI from "openai";
import { passageSections } from "../src/data/passage";

const openai = new OpenAI({
  baseURL: "https://api.apifree.ai/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateQuestions() {
  const fullPassage = passageSections.map((s) => s.content).join("\n\n");

  const sections = passageSections.map((s) => `- ${s.id}: "${s.title}"`).join("\n");

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are an expert reading comprehension question designer for students. Generate high-quality questions that test genuine comprehension, not surface-level recall.

For each section, generate 2 questions. Vary difficulty:
- "foundational": Tests understanding of explicitly stated information, but requires synthesis
- "analytical": Requires analyzing relationships, cause/effect, or structure
- "inferential": Requires reading between the lines or drawing conclusions

Each question should require a typed (free-text) answer, not multiple choice.

Respond with a JSON array:
[
  {
    "id": "q1",
    "sectionId": "section-1",
    "question": "...",
    "keyConceptsForEvaluation": ["concept 1", "concept 2", "concept 3", "concept 4"],
    "difficulty": "foundational" | "analytical" | "inferential"
  }
]

The keyConceptsForEvaluation should be 3-4 key ideas that a good answer would cover. These are used by an AI evaluator to score student responses.`,
      },
      {
        role: "user",
        content: `Passage sections:\n${sections}\n\nFull passage:\n${fullPassage}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  // Strip markdown code fences if present
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const questions = JSON.parse(jsonStr);
    console.log("// Auto-generated questions — paste into src/data/questions.ts");
    console.log(JSON.stringify(questions, null, 2));
  } catch (e) {
    console.error("Failed to parse response:", e);
    console.error("Raw response:", content);
  }
}

generateQuestions();
