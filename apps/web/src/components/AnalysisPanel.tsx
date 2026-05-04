"use client";

import React from "react";
import { useInterviewStore } from "@/store/interview.store";
import { ScoreCard, ImprovementCard, FillerWordBadge } from "@answer-craft/ui";

// -----------------------------------------------------------
// Score bar component
// -----------------------------------------------------------
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color }}>
          {score}
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/100</span>
        </span>
      </div>
      <div
        style={{
          height: "6px",
          background: "rgba(255,255,255,0.07)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: "99px",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// AnalysisPanel
// -----------------------------------------------------------
export function AnalysisPanel() {
  const { session } = useInterviewStore();
  const analysis = session?.analysis;

  if (!analysis) {
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
        <span style={{ fontSize: "40px" }}>🧠</span>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Analysis results will appear here after processing your response.
        </p>
      </div>
    );
  }

  const scoreColorMap = {
    excellent: "#22c55e",
    good: "#84cc16",
    fair: "#f59e0b",
    poor: "#ef4444",
  };

  function getColor(score: number): string {
    if (score >= 80) return scoreColorMap.excellent;
    if (score >= 65) return scoreColorMap.good;
    if (score >= 45) return scoreColorMap.fair;
    return scoreColorMap.poor;
  }

  const overallGrade =
    analysis.overallScore >= 80
      ? "Excellent"
      : analysis.overallScore >= 65
      ? "Good"
      : analysis.overallScore >= 45
      ? "Needs Work"
      : "Needs Improvement";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header summary */}
      <div
        style={{
          padding: "28px",
          background: `linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)`,
          borderRadius: "16px",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Big overall score */}
        <div style={{ textAlign: "center", minWidth: "100px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: getColor(analysis.overallScore),
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {analysis.overallScore}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Overall
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            {overallGrade}
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            {analysis.overallScore >= 80
              ? "Outstanding performance. You demonstrated clear communication and strong technical depth."
              : analysis.overallScore >= 65
              ? "Good response with room for improvement in a few areas."
              : analysis.overallScore >= 45
              ? "Your answer shows potential — focus on the suggestions below."
              : "This response needs significant work. Review the improvements carefully."}
          </p>
        </div>
      </div>

      {/* Score circles */}
      <ScoreCard analysis={analysis} />

      {/* Score bars detail */}
      <div
        style={{
          padding: "24px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Score Breakdown
        </h3>
        <ScoreBar label="Confidence" score={analysis.confidenceScore} color={getColor(analysis.confidenceScore)} />
        <ScoreBar label="Clarity" score={analysis.clarityScore} color={getColor(analysis.clarityScore)} />
        <ScoreBar label="Technical Depth" score={analysis.technicalScore} color={getColor(analysis.technicalScore)} />
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div
          style={{
            padding: "24px",
            background: "rgba(34,197,94,0.06)",
            borderRadius: "14px",
            border: "1px solid rgba(34,197,94,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ✓ Strengths
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {analysis.strengths.map((strength, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                <span style={{ color: "#4ade80", flexShrink: 0, marginTop: "1px" }}>→</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filler words */}
      {analysis.fillerWords.length > 0 && (
        <div
          style={{
            padding: "24px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ⚠️ Filler Words Detected
            </h3>
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
              {analysis.fillerWords.reduce((s, f) => s + f.count, 0)} total
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {analysis.fillerWords.map((f) => (
              <FillerWordBadge key={f.word} word={f.word} count={f.count} />
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {analysis.improvements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            💡 Actionable Improvements
          </h3>
          {analysis.improvements.map((imp, i) => (
            <ImprovementCard key={i} improvement={imp} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
