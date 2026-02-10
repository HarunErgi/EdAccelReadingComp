import { Question } from "@/lib/types";

// Pre-generated questions. Can be regenerated via: npx ts-node scripts/generate-questions.ts
export const questions: Question[] = [
  // Section 1: The Hive & The Queen
  {
    id: "q1",
    sectionId: "section-1",
    question:
      "The queen bee has an impressive title, but the passage suggests her role is more limited than it sounds. In what way is her title misleading?",
    keyConceptsForEvaluation: [
      "queen doesn't make decisions",
      "her role is only to lay eggs",
      "she doesn't rule or control the hive",
      "title suggests authority she doesn't have",
    ],
    difficulty: "analytical",
  },
  {
    id: "q2",
    sectionId: "section-1",
    question:
      "The author compares beehives to human cities. Based on the passage, what makes the author believe beehives are even more organized?",
    keyConceptsForEvaluation: [
      "every single bee has a job",
      "60,000 bees all with defined roles",
      "more organized than most human cities",
      "structured division of labor",
    ],
    difficulty: "inferential",
  },

  // Section 2: Workers & Drones
  {
    id: "q3",
    sectionId: "section-2",
    question:
      "Describe how a worker bee's responsibilities change as she ages. Why do you think the hive is organized this way?",
    keyConceptsForEvaluation: [
      "young workers: cleaning, feeding larvae, building honeycomb",
      "older workers: guarding the entrance",
      "oldest workers: foraging up to five miles away",
      "progression from safe indoor tasks to riskier outdoor tasks",
    ],
    difficulty: "analytical",
  },
  {
    id: "q4",
    sectionId: "section-2",
    question:
      "Why do the worker bees push the drones out of the hive in autumn? What does this tell us about how the hive prioritizes survival?",
    keyConceptsForEvaluation: [
      "food becomes scarce in autumn",
      "drones don't contribute to food/defense/work",
      "conserving resources for the colony",
      "hive prioritizes the group over individuals",
    ],
    difficulty: "inferential",
  },

  // Section 3: Communication & Legacy
  {
    id: "q5",
    sectionId: "section-3",
    question:
      "Explain how the waggle dance works. What specific information does it communicate to other bees?",
    keyConceptsForEvaluation: [
      "performed by foragers who found flowers",
      "angle of dance shows direction relative to the sun",
      "length of waggle shows distance",
      "tells other bees exactly where to find food",
    ],
    difficulty: "foundational",
  },
  {
    id: "q6",
    sectionId: "section-3",
    question:
      'The passage ends by saying "every spoonful of honey represents the life\'s work of about twelve bees." What is the author trying to make the reader feel or understand with this final statement?',
    keyConceptsForEvaluation: [
      "honey is incredibly labor-intensive to produce",
      "appreciation for how much work goes into honey",
      "the scale of effort relative to the small amount produced",
      "emotional connection to the value of bees' work",
    ],
    difficulty: "inferential",
  },
];
