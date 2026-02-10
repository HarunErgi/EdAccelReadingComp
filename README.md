# EdAccelerate - AI Reading Comprehension

A next-generation reading comprehension interface that uses AI to generate questions, evaluate typed answers, and provide structured feedback that helps students actually learn from their mistakes.

**Live demo:** https://ed-accel-reading-comp.vercel.app/

## Interpretation of Feedback

| Feedback                                                             | How it's addressed                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "It's annoying seeing the entire passage all at once"                | The passage is split into 3 titled sections. Students read one section at a time and answer questions before moving on, keeping each chunk digestible.                                                                                                         |
| "Multiple choice is too easy, I can just guess the answer"           | Every question requires a typed free-text answer. Students must articulate their understanding in their own words - no guessing.                                                                                                                               |
| "I finish the questions and immediately forget what I read"          | Questions appear right after each section while the content is fresh. The passage text stays visible alongside the questions so students can reference it naturally.                                                                                           |
| "When I get an answer wrong, I don't really learn why"               | Feedback is split into two panels: **Assessment** (what you got right/wrong) and **How to Improve** (actionable guidance pointing to specific parts of the passage). For incorrect or partial answers, students must submit a second attempt before moving on. |
| "It feels like a test, not like learning"                            | The entire interface uses warm, encouraging language. Buttons say "I've finished reading" instead of "Submit." Feedback reads like a tutor, not a grading rubric. Partial credit is given for answers that are on the right track.                             |
| "Sometimes I want to go back and re-read a specific part"            | Section navigation tabs at the top let students jump back to any previous section at any time. Completed sections show a checkmark.                                                                                                                            |
| "My younger brother uses the app too and he's way slower at reading" | Adjustable text size (A / A+ / A++) on the welcome screen lets different readers customize their experience.                                                                                                                                                   |

## AI Question Generation Approach

**Strategy: On-demand generation with fallback.**

Questions are generated fresh by AI each time a student starts a session. This means:

- Students get different questions on repeat attempts, preventing memorization
- Questions are tailored to test genuine comprehension across three difficulty levels: foundational, analytical, and inferential
- If the AI generation fails (network issues, missing API key), the app falls back to a pre-written set of questions stored in `src/data/questions.ts`, so the experience never breaks

**Answer evaluation** also uses AI at runtime. When a student submits a typed answer, the API sends the specific passage section (not the full passage) along with the question and key concepts to the model. The AI is instructed to evaluate only based on what the student has read so far - no outside knowledge. It returns structured feedback split into an assessment and improvement guidance.

A standalone generation script (`scripts/generate-questions.ts`) is also included for generating and reviewing questions offline.

## Key Decisions

1. **Section-scoped evaluation** - The AI evaluator only sees the passage section the question relates to, not the full passage. This prevents feedback that references information the student hasn't read yet.
2. **Mandatory second attempt** - When a student gets a question wrong or partially right, they must try again before moving on. This directly addresses the feedback about clicking past explanations without learning.
3. **Two-panel feedback** - Separating "what you got right/wrong" from "how to improve" makes the feedback scannable and actionable rather than a wall of text.
4. **Three-tier scoring** - Correct/partial/incorrect gives more nuanced feedback than binary right/wrong, encouraging students who are on the right track.
5. **Graceful degradation** - AI question generation falls back to pre-written questions if the API is unavailable. The app always works.
6. **Minimal dependencies** - Only `openai` was added beyond the Next.js scaffold. No state management library, no component library. React `useState` is sufficient for this scope.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Regenerating Fallback Questions (Optional)

```bash
OPENROUTER_API_KEY=sk-... npx tsx scripts/generate-questions.ts
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** OpenAI-compatible API via OpenRouter (GPT-4o-mini for question generation and answer evaluation)
- **Deployment:** Vercel

## Improvements with More Time

- Difficulty selector (beginner/intermediate/advanced) that adjusts question complexity per student
- Highlight relevant passage text when showing feedback
- Reading time tracking per section
- More question types (ordering events, fill-in-the-blank, short essay)
- Persistent progress across sessions via localStorage or a database
- Animated transitions between sections and feedback states
- Dark mode support

## Time Spent

~1 hour
