"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import { generateChronicle } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

export default function Chronicle({ state, transitionTo }: Props) {
  const finalChoice = state.selectedUniverse;
  const universe = finalChoice ? getUniverse(finalChoice) : null;
  const accent = universe?.color || "#7c6ef7";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (!state.resumeAnalysis || !finalChoice) { transitionTo("universe-discovery"); return; }
    if (hasInit.current) return;
    hasInit.current = true;
    (async () => {
      try {
        const names: Partial<Record<UniverseType, string>> = {};
        Object.entries(state.allProfiles || {}).forEach(([k, p]) => { if (p) names[k as UniverseType] = (p as any).alternativeName; });
        const res = await generateChronicle({
          resumeAnalysis: state.resumeAnalysis!,
          historianLog: [],
          finalChoice: finalChoice!,
          allCharacterNames: names,
        });
        setData(res);
      } catch (e: any) { setError(e.message || "The chronicle could not be written."); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${accent}12, transparent 55%), var(--bg)` }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("council-of-selves")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Linked<span style={{ color: "var(--violet2)" }}>Out</span></span>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 44, marginBottom: 16, animation: "pulse-glow 2s infinite" }}>📖</div>
            Writing the story of the life you chose...
            <p style={{ fontSize: 12, marginTop: 8, color: "var(--text3)" }}>This is the longest transmission. Give it a moment.</p>
          </div>
        )}
        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "60px 0" }}>{error}</div>}

        {data && (
          <>
            {/* Title page */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", marginBottom: 56, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
                {universe?.emoji} A Chronicle of {universe?.title}
              </p>
              <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 42, fontWeight: 400, fontStyle: "italic", letterSpacing: "-1px", color: "var(--text)", lineHeight: 1.2 }}>
                {data.title}
              </h1>
            </motion.div>

            {/* Prologue */}
            {data.prologue && (
              <Section title="Prologue · The Ordinary Timeline" body={data.prologue} accent={accent} delay={0.1} />
            )}

            {/* Chapters */}
            {(data.chapters || []).map((ch: any, i: number) => (
              <Section key={i} title={`Chapter ${ch.number || i + 1} · ${ch.title}`} body={ch.content} accent={accent} delay={0.15 + i * 0.05} />
            ))}

            {/* Epilogue */}
            {data.epilogue && (
              <Section title="Epilogue · What Became Of Them" body={data.epilogue} accent={accent} delay={0.2} />
            )}

            {/* End */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ textAlign: "center", padding: "40px 0 20px" }}>
              <p style={{ fontSize: 13, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                — Fin —
              </p>
              <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>
                You&apos;ve been linked out. Now you know who you could have become.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, body, accent, delay }: { title: string; body: string; accent: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ width: 3, height: 16, borderRadius: 2, background: accent }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{title}</span>
      </div>
      <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 19, lineHeight: 1.9, color: "var(--text)", fontWeight: 300, whiteSpace: "pre-wrap" }}>
        {clean(body)}
      </p>
    </motion.div>
  );
}
