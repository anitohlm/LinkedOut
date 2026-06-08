"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { generateVillainSelf } from "@/lib/agents/useAgents";
import { getUniverse } from "@/lib/universes";
import { H, logEntry } from "@/lib/historian";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const ROSE = "#f07070";
const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

export default function VillainSelf({ state, transitionTo, updateState }: Props) {
  const universeId = state.selectedUniverse!;
  const cached = state.villainSelves?.[universeId];
  const [data, setData] = useState<any>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (!state.resumeAnalysis) { transitionTo("universe-discovery"); return; }
    if (cached) return;
    if (hasInit.current) return;
    hasInit.current = true;
    (async () => {
      try {
        const res = await generateVillainSelf(state.resumeAnalysis!);
        setData(res);
        // First reveal of this universe's shadow self — record it for the Historian + Chronicle
        logEntry(H.shadowRevealed(getUniverse(universeId).title), state, updateState, {
          toast: true,
          extra: { villainSelves: { ...state.villainSelves, [universeId]: res } },
        });
      } catch (e: any) { setError(e.message || "Failed to reach the shadow timeline."); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* Dark crimson ambient */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% -10%, ${ROSE}10, transparent 55%), var(--bg)` }} />
      <motion.div animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity }}
        style={{ position: "fixed", bottom: "-15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400,
          borderRadius: "50%", background: ROSE, filter: "blur(140px)", zIndex: 0, pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("identity-reconstruction")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>Linked<span style={{ color: "var(--violet2)" }}>Out</span></button>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
            <div style={{ marginBottom: 16, animation: "pulse-glow 2s infinite", display: "flex", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="#f07070" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            Tracing the path you didn&apos;t take...
          </div>
        )}
        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "60px 0" }}>{error}</div>}

        {data && (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="#f07070" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ROSE, marginBottom: 8 }}>
                The Shadow Timeline
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 6 }}>{data.name || data.title}</h1>
              <p style={{ fontSize: 15, color: "var(--text3)" }}>{data.title}</p>
            </motion.div>

            {/* Scores — only render if they are real numbers */}
            {(() => {
              const num = (v: any) => (typeof v === "number" ? v : parseInt(String(v), 10));
              const stats = [["Notoriety", num(data.notoriety)], ["Wealth", num(data.wealth)], ["Threat", num(data.threatLevel)]]
                .filter(([, v]) => Number.isFinite(v as number)) as [string, number][];
              if (stats.length === 0) return null;
              return (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 36,
                    background: `rgba(240,112,112,0.06)`, border: `1px solid ${ROSE}25`, borderRadius: 20, padding: "24px 0" }}>
                  {stats.map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: ROSE, letterSpacing: "-1px" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                    </div>
                  ))}
                </motion.div>
              );
            })()}

            {/* Origin story */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 16 }}>How It Began</p>
              <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 17, lineHeight: 1.85, color: "var(--text2)", whiteSpace: "pre-wrap" }}>{clean(data.originStory)}</p>
            </motion.div>

            {/* Headlines */}
            {data.headlines && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>The Record</p>
                {data.headlines.map((h: string, i: number) => (
                  <div key={i} style={{ background: "var(--surface)", borderLeft: `3px solid ${ROSE}`, borderRadius: 12,
                    padding: "16px 20px", marginBottom: 10, fontFamily: "Crimson Pro, serif", fontStyle: "italic",
                    fontSize: 16, color: "var(--text2)" }}>{h}</div>
                ))}
              </motion.div>
            )}

            {/* Moral compromises */}
            {data.moralCompromises && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 16 }}>The Compromises</p>
                {data.moralCompromises.map((m: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ color: ROSE, marginTop: 2 }}>▸</span>
                    <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{m}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Warning */}
            {data.warningMessage && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ textAlign: "center", padding: "32px 24px", background: "rgba(240,112,112,0.06)",
                  border: `1px solid ${ROSE}25`, borderRadius: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: ROSE, marginBottom: 12 }}>A Warning To You</p>
                <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 19, lineHeight: 1.7, color: "var(--text)" }}>
                  &ldquo;{clean(data.warningMessage)}&rdquo;
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
