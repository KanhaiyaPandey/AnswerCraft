import OpenAI from "openai";
import { toFile } from "openai";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  parseAnalysisResponse,
  withRetry,
} from "@answer-craft/lib";
import type {
  TranscriptionResponse,
  AnalysisRequest,
  AnalysisResponse,
} from "@answer-craft/types";

// -----------------------------------------------------------
// Singleton OpenAI client
// -----------------------------------------------------------
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

// -----------------------------------------------------------
// Transcription via Whisper API
// -----------------------------------------------------------
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
  originalName: string = "recording.webm"
): Promise<TranscriptionResponse> {
  const client = getClient();

  // Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
  const file = await toFile(audioBuffer, originalName, { type: mimeType });

  const startTime = Date.now();

  const response = await withRetry(
    () =>
      client.audio.transcriptions.create({
        model: "whisper-1",
        file,
        response_format: "verbose_json",
        language: "en",
      }),
    2
  );

  const durationSeconds =
    "duration" in response && typeof response.duration === "number"
      ? response.duration
      : (Date.now() - startTime) / 1000;

  return {
    transcript: response.text.trim(),
    durationSeconds,
    language: "language" in response && typeof response.language === "string"
      ? response.language
      : "en",
  };
}

// -----------------------------------------------------------
// AI Analysis via GPT-4o
// -----------------------------------------------------------
export async function analyzeTranscript(
  request: AnalysisRequest,
  durationSeconds?: number
): Promise<AnalysisResponse> {
  const client = getClient();

  const userPrompt = buildAnalysisPrompt({
    transcript: request.transcript,
    question: request.question,
    jobRole: request.jobRole,
    durationSeconds,
  });

  const completion = await withRetry(
    () =>
      client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    2
  );

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return parseAnalysisResponse(raw);
}

// -----------------------------------------------------------
// Health check — verify API key is valid
// -----------------------------------------------------------
export async function verifyOpenAIConnection(): Promise<boolean> {
  try {
    const client = getClient();
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}
