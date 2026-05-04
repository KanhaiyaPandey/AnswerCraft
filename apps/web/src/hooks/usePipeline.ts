"use client";

import { useCallback } from "react";
import { useInterviewStore } from "@/store/interview.store";
import { runPipeline } from "@/lib/api-client";

export function usePipeline() {
  const {
    session,
    setStatus,
    setTranscript,
    setAnalysis,
    setError,
    endSession,
  } = useInterviewStore();

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      if (!session) return;

      endSession();
      setStatus("transcribing");

      try {
        await runPipeline(
          audioBlob,
          {
            question: session.question,
            jobRole: session.jobRole,
          },
          {
            onTranscriptionStart: () => {
              setStatus("transcribing");
            },
            onTranscriptionDone: (data) => {
              setTranscript(data);
            },
            onAnalysisStart: () => {
              setStatus("analyzing");
            },
            onAnalysisDone: (data) => {
              setAnalysis(data);
            },
            onError: (message) => {
              setError(message);
            },
          }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Pipeline failed";
        setError(message);
      }
    },
    [session, endSession, setStatus, setTranscript, setAnalysis, setError]
  );

  return { processAudio };
}
