"use client";

import React, { useEffect, useState } from "react";
import { useInterviewStore } from "@/store/interview.store";
import { RecorderPanel } from "@/components/RecorderPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { MockQuestionSelector } from "@/components/MockQuestionSelector";
import { checkApiHealth } from "@/lib/api-client";

// -----------------------------------------------------------
// Tab bar
// -----------------------------------------------------------
const TABS = [
  { key: "record",     label: "Record",     icon: "🎙️" },
  { key: "transcript", label: "Transcript", icon: "📝" },
  { key: "analysis",   label: "Analysis",   icon: "✨" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function TabBar({ active, onSelect, sessionStatus }: {
  active: Tab;
  onSelect: (t: Tab) => void;
  sessionStatus?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        gap: "4px",
        padding: "0 4px",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const isDisabled =
          (tab.key === "transcript" || tab.key === "analysis") &&
          !sessionStatus;

        return (
          <button
            key={tab.key}
            onClick={() => !isDisabled && onSelect(tab.key)}
            style={{
              padding: "14px 20px",
              border: "none",
              background: "none",
              fontSize: "13px",
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? "#fff"
                : isDisabled
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.5)",
              cursor: isDisabled ? "default" : "pointer",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              position: "relative",
              borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            <span style={{ fontSize: "15px" }}>{tab.icon}</span>
            {tab.label}
            {tab.key === "analysis" && sessionStatus === "done" && (
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#22c55e", flexShrink: 0,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------
// API Health Banner
// -----------------------------------------------------------
function ApiHealthBanner() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiHealth().then(setHealthy);
  }, []);

  if (healthy === null || healthy === true) return null;

  return (
    <div style={{
      padding: "10px 20px",
      background: "rgba(245,158,11,0.12)",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: "10px",
      fontSize: "13px",
      color: "#fcd34d",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      <span>⚠️</span>
      <span>
        API server not reachable at <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>localhost:3001</code>.
        Run <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>npm run dev</code> in <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>apps/api</code> and set your <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>OPENAI_API_KEY</code>.
      </span>
    </div>
  );
}

// -----------------------------------------------------------
// Session history chip
// -----------------------------------------------------------
function SessionChip({ status }: { status?: string }) {
  if (!status || status === "idle") return null;

  const map: Record<string, { label: string; color: string }> = {
    recording:    { label: "Recording", color: "#ef4444" },
    transcribing: { label: "Transcribing…", color: "#f59e0b" },
    analyzing:    { label: "Analyzing…", color: "#818cf8" },
    done:         { label: "Complete", color: "#22c55e" },
    error:        { label: "Error", color: "#ef4444" },
  };

  const info = map[status];
  if (!info) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "4px 12px", borderRadius: "99px",
      background: `${info.color}18`,
      border: `1px solid ${info.color}44`,
    }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: info.color,
        animation: status === "recording" ? "pulse-ring 1.5s ease infinite" : "none",
      }} />
      <span style={{ fontSize: "12px", fontWeight: 600, color: info.color }}>{info.label}</span>
    </div>
  );
}

// -----------------------------------------------------------
// Main page
// -----------------------------------------------------------
export default function Home() {
  const { activeTab, setActiveTab, session, resetSession } = useInterviewStore();

  const handleTabSelect = (tab: Tab) => setActiveTab(tab);

  return (
    <>
      {/* Background mesh */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 60% at 15% 10%, rgba(99,102,241,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(139,92,246,0.07) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* App shell */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateColumns: "var(--sidebar-width) 1fr",
        gridTemplateRows: "auto 1fr",
        minHeight: "100dvh",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>

        {/* ── Top bar ── */}
        <header style={{
          gridColumn: "1 / -1",
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          background: "rgba(9,9,15,0.7)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Logo mark */}
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}>
              🎯
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px", fontWeight: 700,
                color: "#fff", letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                Answer Craft
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                AI-powered interview coach
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <SessionChip status={session?.status} />
            {session && (
              <button
                onClick={resetSession}
                style={{
                  padding: "7px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "12px", fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                New Session
              </button>
            )}
          </div>
        </header>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 24px",
          overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "24px",
        }}>
          {/* Section header */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px", fontWeight: 700,
              color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
              marginBottom: "6px",
            }}>
              Set up your<br />
              <span style={{ color: "var(--brand-400)" }}>interview session</span>
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              Choose a mode, pick a question, then hit record.
            </p>
          </div>

          <ApiHealthBanner />
          <MockQuestionSelector />

          {/* How it works */}
          <div style={{
            padding: "18px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", gap: "12px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              How it works
            </p>
            {[
              ["1", "Choose a question or freestyle", "#818cf8"],
              ["2", "Record your answer", "#34d399"],
              ["3", "AI transcribes & analyzes", "#f472b6"],
              ["4", "Review your scores & improve", "#f59e0b"],
            ].map(([num, text, color]) => (
              <div key={num} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                  background: `${color}22`, border: `1px solid ${color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color,
                }}>
                  {num}
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main panel ── */}
        <main style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar */}
          <TabBar
            active={activeTab as Tab}
            onSelect={handleTabSelect}
            sessionStatus={session?.status}
          />

          {/* Panel content */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "28px 32px",
          }}>
            {activeTab === "record" && (
              <div className="animate-fade-in">
                <SectionHeader
                  title="Record Your Response"
                  subtitle={
                    session?.question
                      ? `Question: "${session.question.slice(0, 80)}${session.question.length > 80 ? "…" : ""}"`
                      : "Press start and answer naturally. Aim for 1–3 minutes."
                  }
                />
                <RecorderPanel />
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="animate-slide-up">
                <SectionHeader
                  title="Transcript"
                  subtitle="Your response with filler words highlighted"
                />
                <TranscriptPanel />
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="animate-slide-up">
                <SectionHeader
                  title="AI Analysis"
                  subtitle="Powered by GPT-4o — scores, strengths, and actionable improvements"
                />
                <AnalysisPanel />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "26px", fontWeight: 700,
        color: "#fff", letterSpacing: "-0.03em",
        marginBottom: "6px",
      }}>
        {title}
      </h1>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
        {subtitle}
      </p>
    </div>
  );
}
