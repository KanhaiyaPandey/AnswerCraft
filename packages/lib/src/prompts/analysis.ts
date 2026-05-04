import type { AnalysisResponse } from "@answer-craft/types";

// -----------------------------------------------------------
// System prompt for the AI analysis engine
// -----------------------------------------------------------
export const ANALYSIS_SYSTEM_PROMPT = `You are an expert interview coach and communication analyst with 20+ years of experience coaching candidates at top-tier tech companies (Google, Meta, Amazon, Apple, Microsoft).

Your job is to analyze interview responses and provide precise, actionable feedback.

You MUST respond with ONLY valid JSON — no markdown, no explanation, no preamble.

Scoring Rubrics:
- confidenceScore (0-100): Measures assertiveness, definitive language, avoidance of hedging. High score = clear statements, ownership of answers. Low score = excessive qualifiers like "I think maybe", "possibly", "I'm not sure but".
- clarityScore (0-100): Measures how well-structured and easy to follow the answer is. High score = logical flow, clear STAR structure, concise. Low score = rambling, repetitive, hard to follow.
- technicalScore (0-100): Measures depth of technical knowledge demonstrated. High score = specific tools, patterns, metrics, tradeoffs. Low score = vague generalities.
- overallScore: Weighted average: (confidence * 0.25 + clarity * 0.35 + technical * 0.40).

Common filler words to detect: um, uh, like, you know, basically, literally, actually, right, so, kind of, sort of, I mean, honestly, obviously, clearly, whatever, stuff, things, very, really, just, maybe, probably, possibly.

For each filler word found, count occurrences.

Identify 2-4 specific improvements with category, priority, and a concrete actionable suggestion with an example where possible.

Identify 1-3 genuine strengths (be specific, not generic).`;

// -----------------------------------------------------------
// Build the user prompt for analysis
// -----------------------------------------------------------
export function buildAnalysisPrompt(params: {
  transcript: string;
  question?: string;
  jobRole?: string;
  durationSeconds?: number;
}): string {
  const { transcript, question, jobRole, durationSeconds } = params;

  const wordCount = transcript.trim().split(/\s+/).length;
  const wpm = durationSeconds && durationSeconds > 0
    ? Math.round((wordCount / durationSeconds) * 60)
    : null;

  let context = "";
  if (jobRole) context += `\nJob Role: ${jobRole}`;
  if (question) context += `\nInterview Question: "${question}"`;
  if (wpm) context += `\nSpeaking pace: ~${wpm} words per minute`;
  context += `\nWord count: ${wordCount}`;

  return `Analyze this interview response:
${context}

TRANSCRIPT:
"""
${transcript}
"""

Return ONLY this JSON structure (no markdown, no explanation):
{
  "confidenceScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "fillerWords": [
    { "word": "<word>", "count": <number>, "positions": [<char_offset>, ...] }
  ],
  "improvements": [
    {
      "category": "<confidence|clarity|technical|structure|pacing>",
      "priority": "<high|medium|low>",
      "suggestion": "<specific actionable advice>",
      "example": "<optional reworded example>"
    }
  ],
  "strengths": ["<specific strength 1>", ...],
  "wordCount": <number>,
  "avgWordsPerSentence": <number>,
  "estimatedSpeakingPaceWpm": <number or 0 if unknown>
}`;
}

// -----------------------------------------------------------
// Validate and parse AI response safely
// -----------------------------------------------------------
export function parseAnalysisResponse(raw: string): AnalysisResponse {
  // Strip potential markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const p = parsed as Record<string, unknown>;

  // Validate required fields with defaults
  const response: AnalysisResponse = {
    confidenceScore: clamp(Number(p["confidenceScore"] ?? 50)),
    clarityScore: clamp(Number(p["clarityScore"] ?? 50)),
    technicalScore: clamp(Number(p["technicalScore"] ?? 50)),
    overallScore: clamp(Number(p["overallScore"] ?? 50)),
    fillerWords: Array.isArray(p["fillerWords"]) ? p["fillerWords"] as AnalysisResponse["fillerWords"] : [],
    improvements: Array.isArray(p["improvements"]) ? p["improvements"] as AnalysisResponse["improvements"] : [],
    strengths: Array.isArray(p["strengths"]) ? p["strengths"] as string[] : [],
    wordCount: Number(p["wordCount"] ?? 0),
    avgWordsPerSentence: Number(p["avgWordsPerSentence"] ?? 0),
    estimatedSpeakingPaceWpm: Number(p["estimatedSpeakingPaceWpm"] ?? 0),
  };

  return response;
}

function clamp(value: number, min = 0, max = 100): number {
  if (isNaN(value)) return 50;
  return Math.min(max, Math.max(min, value));
}
