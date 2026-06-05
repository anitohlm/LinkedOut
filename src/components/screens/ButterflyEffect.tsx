"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { generateButterflyEffect } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const LETTER_COLORS = ["#7c6ef7", "#4ecdc4", "#e8c97e", "#f07070"];
const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

export default function ButterflyEffect({ state, transitionTo, updateState }: Props) {
  const [decision, setDecision] = useState("");
  const [timelines, setTimelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!decision.trim() || loading || !state.resumeAnalysis) return;
    setLoading(true);
    setError(null);
    setTimelines([]);
    try {
      const res = await generateButterflyEffect(decision.trim(), state.resumeAnalysis);
      setTimelines(res.timelines || []);
      if (res.stabilityDelta) {
        const s = Math.max(0, Math.min(100, state.timelineState.stability + res.stabilityDelta));
        updateState({ timelineState: { stability: s, status: s >= 70 ? "stable" : s >= 40 ? "unstable" : "critical" } });
      }
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
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Linked<span style={{ color: "var(--violet2)" }}>Out</span></span>
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

        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "20px 0" }}>{error}</div>}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🦋</div>
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
