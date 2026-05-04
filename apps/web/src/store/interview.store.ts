import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { InterviewSession, AnalysisResponse, TranscriptionResponse, InterviewMode, MockQuestion } from "@answer-craft/types";
import { generateSessionId } from "@answer-craft/lib";

// -----------------------------------------------------------
// Recording state (MediaRecorder-level)
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
// Main store interface
// -----------------------------------------------------------
interface InterviewStore {
  // Session
  session: InterviewSession | null;
  mode: InterviewMode;
  currentQuestion: MockQuestion | null;
  jobRole: string;

  // Recording
  recording: RecordingState;

  // UI state
  activeTab: "record" | "transcript" | "analysis";

  // Actions — Session
  startSession: () => void;
  endSession: () => void;
  setMode: (mode: InterviewMode) => void;
  setJobRole: (role: string) => void;
  setCurrentQuestion: (question: MockQuestion | null) => void;

  // Actions — Recording
  setRecording: (patch: Partial<RecordingState>) => void;
  resetRecording: () => void;

  // Actions — Pipeline
  setStatus: (status: InterviewSession["status"]) => void;
  setTranscript: (result: TranscriptionResponse) => void;
  setAnalysis: (analysis: AnalysisResponse) => void;
  setError: (error: string) => void;

  // Actions — UI
  setActiveTab: (tab: "record" | "transcript" | "analysis") => void;
  resetSession: () => void;
}

const DEFAULT_RECORDING: RecordingState = {
  isRecording: false,
  isPaused: false,
  durationMs: 0,
  audioBlob: null,
  audioUrl: null,
  error: null,
};

// -----------------------------------------------------------
// Store
// -----------------------------------------------------------
export const useInterviewStore = create<InterviewStore>()(
  devtools(
    (set, get) => ({
      session: null,
      mode: "free",
      currentQuestion: null,
      jobRole: "",
      recording: { ...DEFAULT_RECORDING },
      activeTab: "record",

      startSession: () => {
        const { mode, currentQuestion, jobRole } = get();
        set({
          session: {
            id: generateSessionId(),
            mode,
            startedAt: new Date().toISOString(),
            question: currentQuestion?.question,
            jobRole: jobRole || undefined,
            transcript: "",
            analysis: null,
            status: "recording",
          },
          activeTab: "record",
        });
      },

      endSession: () => {
        const { session } = get();
        if (session) {
          set({
            session: { ...session, endedAt: new Date().toISOString() },
          });
        }
      },

      setMode: (mode) => set({ mode }),
      setJobRole: (jobRole) => set({ jobRole }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),

      setRecording: (patch) =>
        set((state) => ({ recording: { ...state.recording, ...patch } })),

      resetRecording: () => set({ recording: { ...DEFAULT_RECORDING } }),

      setStatus: (status) =>
        set((state) => ({
          session: state.session ? { ...state.session, status } : null,
        })),

      setTranscript: (result) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, transcript: result.transcript, status: "analyzing" }
            : null,
          activeTab: "transcript",
        })),

      setAnalysis: (analysis) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, analysis, status: "done" }
            : null,
          activeTab: "analysis",
        })),

      setError: (error) =>
        set((state) => ({
          session: state.session ? { ...state.session, status: "error" } : null,
          recording: { ...state.recording, error },
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      resetSession: () =>
        set({
          session: null,
          recording: { ...DEFAULT_RECORDING },
          activeTab: "record",
        }),
    }),
    { name: "InterviewStore" }
  )
);
