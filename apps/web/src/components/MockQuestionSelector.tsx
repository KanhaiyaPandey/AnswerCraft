"use client";

import React, { useState } from "react";
import { useInterviewStore } from "@/store/interview.store";
import { MOCK_QUESTIONS, getRandomQuestion } from "@answer-craft/lib";
import type { MockQuestion } from "@answer-craft/types";

const CATEGORIES: MockQuestion["category"][] = ["behavioral", "technical", "situational"];
const DIFFICULTIES: MockQuestion["difficulty"][] = ["junior", "mid", "senior"];

const categoryColors: Record<MockQuestion["category"], string> = {
  behavioral: "#818cf8",
  technical:  "#34d399",
  situational: "#f472b6",
};

const difficultyColors: Record<MockQuestion["difficulty"], string> = {
  junior: "#22c55e",
  mid:    "#f59e0b",
  senior: "#ef4444",
};

export function MockQuestionSelector() {
  const { currentQuestion, setCurrentQuestion, mode, setMode, jobRole, setJobRole } =
    useInterviewStore();

  const [filterCategory, setFilterCategory] = useState<MockQuestion["category"] | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<MockQuestion["difficulty"] | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = MOCK_QUESTIONS.filter((q) => {
    if (filterCategory !== "all" && q.category !== filterCategory) return false;
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  const handleRandom = () => {
    const q = getRandomQuestion({
      category: filterCategory !== "all" ? filterCategory : undefined,
      difficulty: filterDifficulty !== "all" ? filterDifficulty : undefined,
    });
    setCurrentQuestion(q);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "10px",
          padding: "4px",
          gap: "4px",
        }}
      >
        {(["free", "mock"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "7px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              background: mode === m ? "rgba(99,102,241,0.8)" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          >
            {m === "free" ? "🎙️ Free Response" : "📋 Mock Interview"}
          </button>
        ))}
      </div>

      {/* Job role */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Job Role (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Senior Frontend Engineer, Product Manager…"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "inherit",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Mock mode controls */}
      {mode === "mock" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                style={selectStyle}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "140px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Difficulty
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as any)}
                style={selectStyle}
              >
                <option value="all">All Levels</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Random pick button */}
          <button onClick={handleRandom} style={randomBtnStyle}>
            🎲 Pick Random Question
          </button>

          {/* Current question */}
          {currentQuestion && (
            <div
              style={{
                padding: "20px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <CategoryBadge category={currentQuestion.category} />
                <DifficultyBadge difficulty={currentQuestion.difficulty} />
              </div>
              <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, fontWeight: 500 }}>
                {currentQuestion.question}
              </p>
              {currentQuestion.hints && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Hints
                  </p>
                  <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {currentQuestion.hints.map((h, i) => (
                      <li key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setCurrentQuestion(null)}
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Clear question
              </button>
            </div>
          )}

          {/* Question list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                {filtered.length} question{filtered.length !== 1 ? "s" : ""}
              </span>
              {filtered.length > 3 && (
                <button
                  onClick={() => setShowAll((s) => !s)}
                  style={{ background: "none", border: "none", color: "#818cf8", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {showAll ? "Show less" : `Show all ${filtered.length}`}
                </button>
              )}
            </div>
            {(showAll ? filtered : filtered.slice(0, 3)).map((q) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(q)}
                style={{
                  padding: "14px 16px",
                  background: currentQuestion?.id === q.id
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${currentQuestion?.id === q.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "10px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <CategoryBadge category={q.category} />
                  <DifficultyBadge difficulty={q.difficulty} />
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                  {q.question}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: MockQuestion["category"] }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
      background: `${categoryColors[category]}22`,
      color: categoryColors[category],
      border: `1px solid ${categoryColors[category]}44`,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {category}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: MockQuestion["difficulty"] }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
      background: `${difficultyColors[difficulty]}22`,
      color: difficultyColors[difficulty],
      border: `1px solid ${difficultyColors[difficulty]}44`,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {difficulty}
    </span>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
  width: "100%",
};

const randomBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "rgba(99,102,241,0.15)",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: "8px",
  color: "#818cf8",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.2s",
};
