"use client";

import { useRef, useCallback, useEffect } from "react";
import { useInterviewStore } from "@/store/interview.store";

const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { recording, setRecording, resetRecording } = useInterviewStore();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    const startTime = Date.now() - (useInterviewStore.getState().recording.durationMs);
    timerRef.current = setInterval(() => {
      setRecording({ durationMs: Date.now() - startTime });
    }, 100);
  }, [setRecording]);

  const startRecording = useCallback(async () => {
    try {
      // Reset previous state
      if (recording.audioUrl) URL.revokeObjectURL(recording.audioUrl);
      chunksRef.current = [];
      resetRecording();

      // Request mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setRecording({ audioBlob: blob, audioUrl: url, isRecording: false });
      };

      recorder.onerror = (e) => {
        setRecording({ error: "Recording failed: " + String(e), isRecording: false });
        stopTimer();
      };

      recorder.start(250); // collect every 250ms
      setRecording({ isRecording: true, error: null, durationMs: 0 });
      startTimer();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow mic access and try again."
          : `Could not start recording: ${String(err)}`;
      setRecording({ error: message, isRecording: false });
    }
  }, [recording.audioUrl, resetRecording, setRecording, startTimer, stopTimer]);

  const stopRecording = useCallback(() => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      stopTimer();
      setRecording({ isPaused: true });
    }
  }, [setRecording, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimer();
      setRecording({ isPaused: false });
    }
  }, [setRecording, startTimer]);

  return {
    recording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
