"use client";

import React, { useState } from "react";
import { useInterviewStore } from "@/store/interview.store";
import { MOCK_QUESTIONS, getRandomQuestion } from "@answer-craft/lib";
import type { MockQuestion } from "@answer-craft/types";

export function MockInterviewSetup() {
  const { mode, setMode, currentQuestion, setCurrentQuestion, jobRole, setJobRole } =
    useInterviewStore();

  const [selectedCategory, setSelectedCategory] = useState<MockQuestion["category"] | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<MockQuestion["difficulty"] | "all">("all");

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (selectedCategory !== "all" && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleRandomQuestion = () => {
    const q = getRandomQuestion({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
    });
    setCurrentQuestion(q);
  };

  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    behavioral: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.35)", text: "#818cf8" },
    technical:  { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.35)",  text: "#4ade80" },
    situational:{ bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
  };

  const difficultyColors: Record<string, string> = {
    junior: "#4ade80",
    mid: "#f59e0b",
    senior: "#ef4444",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
        {(["free", "mock"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 600,
              transition: "all 0.2s",
              background: mode === m ? "rgba(99,102,241,0.8)" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          >
            {m === "free" ? "🎙️ Free Practice" : "📋 Mock Interview"}
          </button>
        ))}
      </div>

      {/* Job role */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Job Role (optional)
        </label>
        <input
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer, Product Manager…"
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
        />
      </div>

      {/* Mock mode — question picker */}
      {mode === "mock" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <FilterPill
              label="All Categories"
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            />
            {(["behavioral", "technical", "situational"] as const).map((cat) => (
              <FilterPill
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                color={categoryColors[cat]?.text}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <FilterPill label="All Levels" active={selectedDifficulty === "all"} onClick={() => setSelectedDifficulty("all")} />
            {(["junior", "mid", "senior"] as const).map((d) => (
              <FilterPill
                key={d}
                label={d.charAt(0).toUpperCase() + d.slice(1)}
                active={selectedDifficulty === d}
                onClick={() => setSelectedDifficulty(d)}
                color={difficultyColors[d]}
              />
            ))}
          </div>

          {/* Random button */}
          <button
            onClick={handleRandomQuestion}
            style={{
              padding: "10px 18px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "10px",
              color: "#818cf8",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              alignSelf: "flex-start",
            }}
          >
            🎲 Random Question
          </button>

          {/* Question list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "360px", overflowY: "auto" }}>
            {filteredQuestions.map((q) => {
              const catStyle = categoryColors[q.category] ?? categoryColors["behavioral"]!;
              const isSelected = currentQuestion?.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(isSelected ? null : q)}
                  style={{
                    padding: "14px 16px",
                    background: isSelected ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSelected ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "99px", background: catStyle.bg,
                      border: `1px solid ${catStyle.border}`, color: catStyle.text,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {q.category}
                    </span>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(255,255,255,0.05)",
                      color: difficultyColors[q.difficulty],
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {q.difficulty}
                    </span>
                    {isSelected && (
                      <span style={{ marginLeft: "auto", fontSize: "12px", color: "#818cf8", fontWeight: 600 }}>
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    {q.question}
                  </p>
                  {isSelected && q.hints && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "4px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      {q.hints.map((hint, i) => (
                        <p key={i} style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                          💡 {hint}
                        </p>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "99px",
        border: active ? `1px solid ${color ?? "rgba(99,102,241,0.6)"}` : "1px solid rgba(255,255,255,0.1)",
        background: active ? `${color ? color + "22" : "rgba(99,102,241,0.2)"}` : "transparent",
        color: active ? (color ?? "#818cf8") : "rgba(255,255,255,0.45)",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}
