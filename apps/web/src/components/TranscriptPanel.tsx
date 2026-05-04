"use client";

import React from "react";
import { useInterviewStore } from "@/store/interview.store";
import { highlightFillerWords } from "@answer-craft/lib";

export function TranscriptPanel() {
  const { session } = useInterviewStore();

  if (!session?.transcript) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "40px" }}>📝</span>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Your transcript will appear here after you record and analyze your response.
        </p>
      </div>
    );
  }

  const fillerWordList = session.analysis?.fillerWords.map((f) => f.word) ?? [];
  const segments = highlightFillerWords(session.transcript, fillerWordList);

  const wordCount = session.transcript.trim().split(/\s+/).length;
  const fillerCount = session.analysis?.fillerWords.reduce((sum, f) => sum + f.count, 0) ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Meta bar */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Words", value: wordCount },
          { label: "Filler Words", value: fillerCount, warn: fillerCount > 5 },
          session.analysis && {
            label: "Pace",
            value: `${session.analysis.estimatedSpeakingPaceWpm} wpm`,
          },
          session.analysis && {
            label: "Avg Sentence",
            value: `${session.analysis.avgWordsPerSentence.toFixed(1)} words`,
          },
        ]
          .filter(Boolean)
          .map((stat: any) => (
            <div
              key={stat.label}
              style={{
                padding: "8px 16px",
                background: stat.warn
                  ? "rgba(245,158,11,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${stat.warn ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: stat.warn ? "#f59e0b" : "rgba(255,255,255,0.9)",
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
      </div>

      {/* Question context */}
      {session.question && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "10px",
            borderLeft: "3px solid #6366f1",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#818cf8",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Question
          </span>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
            {session.question}
          </p>
        </div>
      )}

      {/* Transcript text */}
      <div
        style={{
          padding: "24px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.07)",
          lineHeight: 1.9,
          fontSize: "15px",
          color: "rgba(255,255,255,0.82)",
          fontFamily: "Georgia, serif",
        }}
      >
        {segments.map((seg, i) =>
          seg.isFiller ? (
            <mark
              key={i}
              title={`Filler word: "${seg.word}"`}
              style={{
                background: "rgba(245,158,11,0.22)",
                color: "#fcd34d",
                borderRadius: "4px",
                padding: "1px 4px",
                border: "1px solid rgba(245,158,11,0.35)",
                fontStyle: "italic",
                cursor: "help",
              }}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {/* Legend */}
      {fillerWordList.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <mark
            style={{
              background: "rgba(245,158,11,0.22)",
              color: "#fcd34d",
              borderRadius: "4px",
              padding: "1px 6px",
              border: "1px solid rgba(245,158,11,0.35)",
            }}
          >
            highlighted
          </mark>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>= filler word detected</span>
        </div>
      )}
    </div>
  );
}
