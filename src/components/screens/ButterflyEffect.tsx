"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { generateButterflyEffect } from "@/lib/agents/useAgents";
import { applyEvent } from "@/lib/stability";
import { H, logEntry } from "@/lib/historian";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const LETTER_COLORS = ["#7c6ef7", "#4ecdc4", "#e8c97e", "#f07070"];
const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

// Resume-aware "what if" decision prompts, mixed with evergreen life pivots.
function whatIfSuggestions(state: AppState): string[] {
  const a = state.resumeAnalysis;
  const field = a?.industries?.[0] || "my field";
  const skill = a?.skills?.[0];
  const pool = [
    `What if I never went into ${field}?`,
    "What if I'd started my own company?",
    "What if I'd moved to another country?",
    "What if I'd taken the job I turned down?",
    "What if I'd followed my creative side instead?",
    "What if I'd never played it safe?",
    "What if I'd said yes to the risky opportunity?",
    skill ? `What if I'd never learned ${skill}?` : "What if I'd chased money instead of meaning?",
  ];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
}

export default function ButterflyEffect({ state, transitionTo, updateState }: Props) {
  const cached = state.butterflyCache;
  const [decision, setDecision] = useState(cached?.decision ?? "");
  const [timelines, setTimelines] = useState<any[]>(cached?.timelines ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mark this phase as reached — unlocks the Council
  useEffect(() => {
    if (!state.usedButterfly) updateState({ usedButterfly: true });
  }, []);

  const generate = async () => {
    if (!decision.trim() || loading || !state.resumeAnalysis) return;
    setLoading(true);
    setError(null);
    setTimelines([]);
    try {
      const res = await generateButterflyEffect(decision.trim(), state.resumeAnalysis);
      const newTimelines = res.timelines || [];
      setTimelines(newTimelines);
      // Rewriting a decision always destabilizes the timeline
      const prevStab = state.timelineState.stability;
      const { stability, status, event } = applyEvent(prevStab, "timeline-drift");
      const loss = prevStab - stability;
      logEntry(H.butterflyAsked(decision.trim(), loss), state, updateState, { toast: true });
      updateState({
        timelineState: { stability, status },
        stabilityMessage: event.message,
        butterflyCache: { decision: decision.trim(), timelines: newTimelines },
      });
    } catch (e: any) {
      setError(e.message || "The timelines refused to fracture. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>Linked<span style={{ color: "var(--violet2)" }}>Out</span></button>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
            Butterfly Effect Engine
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
            What If?
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.6 }}>
            Change one decision. Watch your life fracture across four alternate timelines.
          </p>
        </motion.div>

        {/* Input */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
          <input
            value={decision}
            onChange={e => setDecision(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") generate(); }}
            placeholder="What if I never studied my field?"
            style={{
              flex: 1, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: 12, color: "var(--text)", fontFamily: "Sora, sans-serif", fontSize: 15, outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--violet)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
          />
          <button onClick={generate} disabled={loading || !decision.trim()}
            style={{
              padding: "0 28px", borderRadius: 12, border: "none",
              background: decision.trim() && !loading ? "var(--violet)" : "var(--surface)",
              color: decision.trim() && !loading ? "#fff" : "var(--text3)",
              fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600,
              cursor: decision.trim() && !loading ? "pointer" : "default", whiteSpace: "nowrap",
            }}>
            {loading ? "Fracturing..." : "Generate →"}
          </button>
        </div>

        {/* Suggestion chips */}
        {!timelines.length && !loading && (
          <div style={{ marginTop: -24, marginBottom: 40 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/></svg> Try one of these:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {whatIfSuggestions(state).map((s) => (
                <button key={s} onClick={() => setDecision(s)}
                  style={{
                    padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                    background: "rgba(124,110,247,0.1)", border: "1px solid rgba(124,110,247,0.3)",
                    color: "var(--text2)", fontFamily: "Sora, sans-serif", fontSize: 13, transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(124,110,247,0.2)"; b.style.color = "var(--text)"; b.style.borderColor = "var(--violet)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(124,110,247,0.1)"; b.style.color = "var(--text2)"; b.style.borderColor = "rgba(124,110,247,0.3)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "20px 0" }}>{error}</div>}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
            <div style={{ marginBottom: 12, animation: "float 3s ease-in-out infinite", display: "flex", justifyContent: "center" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 12C10 8 4 6 2 9s2 7 6 6c-2 2-2 5 4 3" stroke="#7c6ef7" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 12C14 8 20 6 22 9s-2 7-6 6c2 2 2 5-4 3" stroke="#4ecdc4" strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="14" r="1.2" fill="#e8c97e"/></svg>
            </div>
            Splitting your timeline four ways...
          </div>
        )}

        {/* Timeline grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <AnimatePresence>
            {timelines.map((tl, i) => {
              const color = LETTER_COLORS[i % 4];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 16,
                    background: `${color}20`, color,
                  }}>{tl.letter || String.fromCharCode(65 + i)}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 6, color: "var(--text)" }}>{tl.title}</h3>
                  {tl.universe && <p style={{ fontSize: 11, color, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{tl.universe}</p>}
                  <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 16 }}>{clean(tl.summary)}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(tl.milestones || []).map((m: string, mi: number) => (
                      <div key={mi} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: color, marginTop: 7, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
