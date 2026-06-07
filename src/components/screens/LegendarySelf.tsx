"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { generateLegendarySelf } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const GOLD = "#e8c97e";
const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

export default function LegendarySelf({ state, transitionTo, updateState }: Props) {
  const universeId = state.selectedUniverse!;
  const cached = state.legendarySelves?.[universeId];
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
        const res = await generateLegendarySelf(state.resumeAnalysis!);
        setData(res);
        updateState({ legendarySelves: { ...state.legendarySelves, [universeId]: res } });
      } catch (e: any) { setError(e.message || "Failed to summon your legend."); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* Golden ambient glow */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% -10%, ${GOLD}14, transparent 55%), var(--bg)` }} />
      <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }}
        style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400,
          borderRadius: "50%", background: GOLD, filter: "blur(130px)", zIndex: 0, pointerEvents: "none" }} />

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
            <div style={{ marginBottom: 16, animation: "float 4s ease-in-out infinite", display: "flex", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M3 17l2.5-8L9 13l3-7 3 7 3.5-4L21 17H3z" stroke="#e8c97e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h18" stroke="#e8c97e" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            Summoning your greatest possible self...
          </div>
        )}
        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "60px 0" }}>{error}</div>}

        {data && (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ marginBottom: 16, animation: "float 4s ease-in-out infinite", display: "flex", justifyContent: "center" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M3 17l2.5-8L9 13l3-7 3 7 3.5-4L21 17H3z" stroke="#e8c97e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h18" stroke="#e8c97e" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                The Legendary Timeline
              </p>
              <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 6 }}>{data.title}</h1>
              <p style={{ fontSize: 15, color: "var(--text3)" }}>{data.organization}{data.era ? ` · ${data.era}` : ""}</p>
            </motion.div>

            {/* Scores — only numeric values */}
            {(() => {
              const entries = Object.entries(data.scores || {})
                .map(([k, v]) => [k, typeof v === "number" ? v : parseInt(String(v), 10)] as [string, number])
                .filter(([, v]) => Number.isFinite(v));
              if (entries.length === 0) return null;
              return (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 36,
                    background: `linear-gradient(135deg, ${GOLD}0d, var(--surface))`, border: `1px solid ${GOLD}25`,
                    borderRadius: 20, padding: "24px 0" }}>
                  {entries.map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: GOLD, letterSpacing: "-1px" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                    </div>
                  ))}
                </motion.div>
              );
            })()}

            {/* Narrative */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 18, lineHeight: 1.85, color: "var(--text)", fontWeight: 300, whiteSpace: "pre-wrap" }}>
                {clean(data.inspirationalNarrative)}
              </p>
            </motion.div>

            {/* Achievements */}
            {data.achievements && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 16 }}>Legendary Achievements</p>
                {data.achievements.map((a: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ color: GOLD, marginTop: 2 }}>✦</span>
                    <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{a}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Defining quote */}
            {data.definingQuote && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ textAlign: "center", padding: "32px 24px", background: `linear-gradient(135deg, ${GOLD}0d, var(--surface))`,
                  border: `1px solid ${GOLD}25`, borderRadius: 20 }}>
                <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 20, lineHeight: 1.7, color: "var(--text)" }}>
                  &ldquo;{clean(data.definingQuote)}&rdquo;
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
