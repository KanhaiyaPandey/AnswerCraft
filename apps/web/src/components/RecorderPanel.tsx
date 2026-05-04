"use client";

import React, { useEffect, useRef } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { usePipeline } from "@/hooks/usePipeline";
import { useInterviewStore } from "@/store/interview.store";
import { formatDuration } from "@answer-craft/lib";

// -----------------------------------------------------------
// Animated waveform bars
// -----------------------------------------------------------
function WaveformBars({ isActive }: { isActive: boolean }) {
  const bars = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "48px" }}>
      {bars.map((i) => (
        <div
          key={i}
          style={{
            width: "3px",
            borderRadius: "99px",
            background: isActive
              ? `rgba(99,102,241,${0.4 + Math.random() * 0.6})`
              : "rgba(255,255,255,0.1)",
            height: isActive
              ? `${20 + Math.floor(Math.random() * 80)}%`
              : "20%",
            transition: isActive ? `height ${0.1 + (i % 5) * 0.05}s ease` : "height 0.3s ease",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------
// AudioVisualizer — real-time canvas waveform from mic stream
// -----------------------------------------------------------
function AudioVisualizer({ isRecording }: { isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isRecording) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        ctxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
        audioCtx.createMediaStreamSource(stream).connect(analyser);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = ((dataArray[i] ?? 0) / 255) * canvas.height;
            const alpha = 0.4 + ((dataArray[i] ?? 0) / 255) * 0.6;
            ctx.fillStyle = `rgba(99,102,241,${alpha})`;
            ctx.beginPath();
            ctx.roundRect(
              x,
              canvas.height / 2 - barHeight / 2,
              barWidth - 1,
              barHeight,
              2
            );
            ctx.fill();
            x += barWidth + 1;
          }
        };
        draw();
      } catch {
        // mic not available (already in use by MediaRecorder)
      }
    })();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ctxRef.current?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={64}
      style={{
        width: "100%",
        height: "64px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.03)",
        display: "block",
      }}
    />
  );
}

// -----------------------------------------------------------
// RecorderPanel
// -----------------------------------------------------------
export function RecorderPanel() {
  const { recording, startRecording, stopRecording, pauseRecording, resumeRecording } =
    useRecorder();
  const { processAudio } = usePipeline();
  const { session, startSession, resetSession } = useInterviewStore();

  const handleStart = async () => {
    startSession();
    await startRecording();
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleSubmit = async () => {
    if (recording.audioBlob) {
      await processAudio(recording.audioBlob);
    }
  };

  const handleReset = () => {
    resetSession();
  };

  const isIdle = !session && !recording.isRecording && !recording.audioBlob;
  const isProcessing =
    session?.status === "transcribing" || session?.status === "analyzing";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Status Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: recording.isRecording
                ? "#ef4444"
                : recording.audioBlob
                ? "#22c55e"
                : "rgba(255,255,255,0.2)",
              boxShadow: recording.isRecording ? "0 0 0 4px rgba(239,68,68,0.25)" : "none",
              animation: recording.isRecording ? "pulse 1.5s ease infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {recording.isRecording
              ? recording.isPaused
                ? "Paused"
                : "Recording"
              : recording.audioBlob
              ? "Ready to analyze"
              : isProcessing
              ? session?.status === "transcribing"
                ? "Transcribing…"
                : "Analyzing…"
              : "Ready"}
          </span>
        </div>
        {(recording.isRecording || recording.audioBlob) && (
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: recording.isRecording ? "#ef4444" : "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-geist-mono, monospace)",
            }}
          >
            {formatDuration(recording.durationMs)}
          </span>
        )}
      </div>

      {/* Visualizer */}
      <div
        style={{
          padding: "20px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {recording.isRecording ? (
          <AudioVisualizer isRecording={recording.isRecording} />
        ) : recording.audioBlob ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <audio
              src={recording.audioUrl ?? ""}
              controls
              style={{ width: "100%", height: "36px", borderRadius: "8px" }}
            />
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              Review your recording before analyzing
            </p>
          </div>
        ) : isProcessing ? (
          <ProcessingIndicator status={session?.status} />
        ) : (
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
            Click <strong style={{ color: "rgba(255,255,255,0.5)" }}>Start Recording</strong> to begin your interview response
          </p>
        )}
      </div>

      {/* Error */}
      {recording.error && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#fca5a5",
          }}
        >
          ⚠️ {recording.error}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {isIdle && (
          <RecorderButton
            onClick={handleStart}
            variant="record"
            label="Start Recording"
            icon="🎙️"
          />
        )}

        {recording.isRecording && !recording.isPaused && (
          <>
            <RecorderButton
              onClick={handleStop}
              variant="stop"
              label="Stop Recording"
              icon="⏹"
            />
            <RecorderButton
              onClick={pauseRecording}
              variant="ghost"
              label="Pause"
              icon="⏸"
            />
          </>
        )}

        {recording.isRecording && recording.isPaused && (
          <>
            <RecorderButton
              onClick={() => resumeRecording()}
              variant="record"
              label="Resume"
              icon="▶️"
            />
            <RecorderButton
              onClick={handleStop}
              variant="stop"
              label="Stop"
              icon="⏹"
            />
          </>
        )}

        {recording.audioBlob && !isProcessing && (
          <>
            <RecorderButton
              onClick={handleSubmit}
              variant="analyze"
              label="Analyze Response"
              icon="✨"
            />
            <RecorderButton
              onClick={handleReset}
              variant="ghost"
              label="Start Over"
              icon="↺"
            />
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// Processing indicator
// -----------------------------------------------------------
function ProcessingIndicator({ status }: { status?: string }) {
  const steps = [
    { key: "transcribing", label: "Transcribing audio with Whisper…", icon: "🎙️" },
    { key: "analyzing", label: "Analyzing with GPT-4o…", icon: "🧠" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", padding: "8px" }}>
      {steps.map((step) => {
        const isActive = status === step.key;
        const isDone =
          (step.key === "transcribing" && status === "analyzing") ||
          status === "done";
        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              opacity: isDone ? 0.5 : isActive ? 1 : 0.3,
              transition: "opacity 0.3s",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDone
                  ? "rgba(34,197,94,0.2)"
                  : isActive
                  ? "rgba(99,102,241,0.2)"
                  : "rgba(255,255,255,0.05)",
                border: isActive ? "1px solid rgba(99,102,241,0.5)" : "1px solid transparent",
                fontSize: "14px",
              }}
            >
              {isDone ? "✓" : isActive ? (
                <span style={{
                  width: "14px", height: "14px",
                  border: "2px solid rgba(99,102,241,0.4)",
                  borderTopColor: "#6366f1",
                  borderRadius: "50%",
                  display: "block",
                  animation: "spin 0.6s linear infinite",
                }} />
              ) : step.icon}
            </div>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: isActive ? 600 : 400 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------
// RecorderButton
// -----------------------------------------------------------
interface RecorderButtonProps {
  onClick: () => void;
  label: string;
  icon: string;
  variant: "record" | "stop" | "analyze" | "ghost";
}

function RecorderButton({ onClick, label, icon, variant }: RecorderButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    record: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
    },
    stop: {
      background: "rgba(239,68,68,0.15)",
      border: "1px solid rgba(239,68,68,0.4)",
      color: "#fca5a5",
    },
    analyze: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.7)",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        borderRadius: "10px",
        border: "none",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        color: "#fff",
        fontFamily: "inherit",
        transition: "all 0.2s",
        flex: variant === "analyze" ? "1" : "0 0 auto",
        justifyContent: "center",
        ...styles[variant],
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
