"use client";

import React from "react";
import type { AnalysisResponse } from "@answer-craft/types";
import { getScoreGrade } from "@answer-craft/lib";

// -----------------------------------------------------------
// ScoreRing — animated circular score indicator
// -----------------------------------------------------------
interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, label, size = 100, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = getScoreGrade(score);

  const gradeColors: Record<string, string> = {
    excellent: "#22c55e",
    good: "#84cc16",
    fair: "#f59e0b",
    poor: "#ef4444",
  };

  const color = gradeColors[grade] ?? "#6b7280";

  return (
    <div className="score-ring-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: "center",
            fill: color,
            fontSize: `${size * 0.22}px`,
            fontWeight: "700",
            fontFamily: "inherit",
          }}
        >
          {score}
        </text>
      </svg>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

// -----------------------------------------------------------
// ScoreCard — displays all 4 scores in a grid
// -----------------------------------------------------------
interface ScoreCardProps {
  analysis: AnalysisResponse;
}

export function ScoreCard({ analysis }: ScoreCardProps) {
  const scores = [
    { label: "Confidence", score: analysis.confidenceScore },
    { label: "Clarity", score: analysis.clarityScore },
    { label: "Technical", score: analysis.technicalScore },
    { label: "Overall", score: analysis.overallScore },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "24px",
      padding: "32px",
      background: "rgba(255,255,255,0.04)",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(8px)",
    }}>
      {scores.map(({ label, score }) => (
        <ScoreRing key={label} score={score} label={label} size={110} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------
// ImprovementCard — single improvement suggestion
// -----------------------------------------------------------
interface ImprovementCardProps {
  improvement: AnalysisResponse["improvements"][0];
  index: number;
}

export function ImprovementCard({ improvement, index }: ImprovementCardProps) {
  const priorityColors = {
    high: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", dot: "#ef4444" },
    medium: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
    low: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", dot: "#818cf8" },
  };

  const categoryIcons: Record<string, string> = {
    confidence: "💪",
    clarity: "🎯",
    technical: "⚡",
    structure: "📐",
    pacing: "⏱️",
  };

  const colors = priorityColors[improvement.priority];
  const icon = categoryIcons[improvement.category] ?? "💡";

  return (
    <div style={{
      padding: "20px",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      animationDelay: `${index * 0.1}s`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.9)", textTransform: "capitalize" }}>
              {improvement.category}
            </span>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "99px",
              background: colors.border,
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {improvement.priority}
            </span>
          </div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
        {improvement.suggestion}
      </p>
      {improvement.example && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          borderLeft: "2px solid rgba(255,255,255,0.2)",
        }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Example
          </span>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
            "{improvement.example}"
          </p>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------
// FillerWordBadge
// -----------------------------------------------------------
interface FillerWordBadgeProps {
  word: string;
  count: number;
}

export function FillerWordBadge({ word, count }: FillerWordBadgeProps) {
  const intensity = Math.min(count / 5, 1);
  const alpha = 0.3 + intensity * 0.5;

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      background: `rgba(245,158,11,${alpha * 0.2})`,
      border: `1px solid rgba(245,158,11,${alpha * 0.6})`,
      borderRadius: "99px",
      fontSize: "13px",
      fontWeight: 500,
    }}>
      <span style={{ color: "rgba(255,255,255,0.85)" }}>"{word}"</span>
      <span style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#f59e0b",
        background: "rgba(245,158,11,0.2)",
        padding: "1px 7px",
        borderRadius: "99px",
      }}>
        ×{count}
      </span>
    </div>
  );
}
