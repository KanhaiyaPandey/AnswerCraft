import type { MockQuestion } from "@answer-craft/types";

export const MOCK_QUESTIONS: MockQuestion[] = [
  // --- Behavioral ---
  {
    id: "b1",
    category: "behavioral",
    difficulty: "mid",
    question: "Tell me about a time you faced a major technical challenge and how you resolved it.",
    hints: ["Use the STAR method", "Be specific about the technical details", "Quantify the impact"],
    followUps: ["What would you do differently?", "How did the team react?"],
  },
  {
    id: "b2",
    category: "behavioral",
    difficulty: "mid",
    question: "Describe a situation where you had to make a critical decision with incomplete information.",
    hints: ["Focus on your decision-making process", "Mention risks you considered"],
    followUps: ["What was the outcome?", "How did you validate your decision?"],
  },
  {
    id: "b3",
    category: "behavioral",
    difficulty: "senior",
    question: "Tell me about a time you led a project that failed. What did you learn?",
    hints: ["Be honest — interviewers value self-awareness", "Focus on lessons, not blame"],
    followUps: ["What changed in your approach afterward?"],
  },
  {
    id: "b4",
    category: "behavioral",
    difficulty: "junior",
    question: "Describe a time you had to learn a new technology quickly. How did you approach it?",
    hints: ["Mention specific resources you used", "Talk about the outcome"],
  },

  // --- Technical ---
  {
    id: "t1",
    category: "technical",
    difficulty: "mid",
    question: "Explain how you would design a URL shortener service. Walk me through your architecture.",
    hints: ["Consider scale — millions of URLs", "Think about read vs write ratio", "Mention caching strategy"],
    followUps: ["How would you handle analytics?", "How would you handle custom aliases?"],
  },
  {
    id: "t2",
    category: "technical",
    difficulty: "senior",
    question: "How would you optimize a slow database query that's affecting production performance?",
    hints: ["Talk about EXPLAIN plans", "Mention indexing strategies", "Consider caching"],
    followUps: ["When would you choose to denormalize?"],
  },
  {
    id: "t3",
    category: "technical",
    difficulty: "junior",
    question: "Explain the difference between REST and GraphQL. When would you choose one over the other?",
    hints: ["Think about over-fetching and under-fetching", "Consider client flexibility"],
  },
  {
    id: "t4",
    category: "technical",
    difficulty: "mid",
    question: "How do you approach testing in a production application? Describe your testing strategy.",
    hints: ["Mention unit, integration, e2e", "Talk about test coverage philosophy"],
  },

  // --- Situational ---
  {
    id: "s1",
    category: "situational",
    difficulty: "mid",
    question: "You discover a critical security vulnerability in production. What do you do in the next 30 minutes?",
    hints: ["Think about communication first", "Consider rollback vs patch"],
    followUps: ["How do you prevent it in the future?"],
  },
  {
    id: "s2",
    category: "situational",
    difficulty: "senior",
    question: "Two senior engineers disagree on the architecture of a key feature. You're the tech lead. How do you resolve this?",
    hints: ["Think about structured decision-making", "Consider ADRs (Architecture Decision Records)"],
  },
  {
    id: "s3",
    category: "situational",
    difficulty: "junior",
    question: "You're given an impossible deadline by your manager. What do you do?",
    hints: ["Think about scope negotiation", "How do you communicate risk?"],
  },
];

export function getQuestionsByCategory(category: MockQuestion["category"]): MockQuestion[] {
  return MOCK_QUESTIONS.filter((q) => q.category === category);
}

export function getQuestionsByDifficulty(difficulty: MockQuestion["difficulty"]): MockQuestion[] {
  return MOCK_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

export function getRandomQuestion(filters?: {
  category?: MockQuestion["category"];
  difficulty?: MockQuestion["difficulty"];
}): MockQuestion {
  let pool = MOCK_QUESTIONS;
  if (filters?.category) pool = pool.filter((q) => q.category === filters.category);
  if (filters?.difficulty) pool = pool.filter((q) => q.difficulty === filters.difficulty);
  if (!pool.length) pool = MOCK_QUESTIONS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!;
}
