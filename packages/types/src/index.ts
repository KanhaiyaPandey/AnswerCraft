// ============================================================
// @answer-craft/types — Single source of truth for all types
// ============================================================

// -----------------------------------------------------------
// Audio & Recording
// -----------------------------------------------------------
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

// -----------------------------------------------------------
// Transcription
// -----------------------------------------------------------
export interface TranscriptionRequest {
  audioBlob: Blob;
  language?: string;
}

export interface TranscriptionResponse {
  transcript: string;
  durationSeconds: number;
  language: string;
}

// -----------------------------------------------------------
// AI Analysis
// -----------------------------------------------------------
export interface AnalysisRequest {
  transcript: string;
  question?: string;
  jobRole?: string;
}

export interface AnalysisResponse {
  confidenceScore: number;        // 0–100
  clarityScore: number;           // 0–100
  technicalScore: number;         // 0–100
  overallScore: number;           // 0–100 (weighted average)
  fillerWords: FillerWordOccurrence[];
  improvements: Improvement[];
  strengths: string[];
  wordCount: number;
  avgWordsPerSentence: number;
  estimatedSpeakingPaceWpm: number;
}

export interface FillerWordOccurrence {
  word: string;
  count: number;
  positions: number[];            // character offsets in transcript
}

export interface Improvement {
  category: "confidence" | "clarity" | "technical" | "structure" | "pacing";
  priority: "high" | "medium" | "low";
  suggestion: string;
  example?: string;
}

// -----------------------------------------------------------
// Interview Session
// -----------------------------------------------------------
export type InterviewMode = "free" | "mock";

export interface MockQuestion {
  id: string;
  category: "behavioral" | "technical" | "situational";
  difficulty: "junior" | "mid" | "senior";
  question: string;
  hints?: string[];
  followUps?: string[];
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  startedAt: string;             // ISO timestamp
  endedAt?: string;
  jobRole?: string;
  question?: string;
  transcript: string;
  analysis: AnalysisResponse | null;
  status: "idle" | "recording" | "transcribing" | "analyzing" | "done" | "error";
}

// -----------------------------------------------------------
// API Request / Response wrappers
// -----------------------------------------------------------
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// -----------------------------------------------------------
// Streaming (SSE events)
// -----------------------------------------------------------
export type StreamEventType =
  | "transcription_start"
  | "transcription_chunk"
  | "transcription_done"
  | "analysis_start"
  | "analysis_done"
  | "error";

export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  payload: T;
}
