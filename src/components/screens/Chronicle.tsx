"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, ChronicleEdition, MemorySnapshot, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import { generateChronicle } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();
const VIOLET = "#7c6ef7";
const NEW_EDITION_THRESHOLD = 5;

function toRoman(n: number): string {
  const romans = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[n] ?? String(n);
}

function computeSnapshot(state: AppState): MemorySnapshot {
  const transmissionMessages = Object.values(state.transmissions || {}).reduce(
    (acc, t) => acc + (t.messages?.length ?? 0), 0
  );
  const councilMessages = (state.councilMessages || []).length;
  const universesExplored = (state.explored || []).length;
  const historianEvents = (state.historianLog || []).length;
  const stability = state.timelineState.stability;
  return { transmissionMessages, councilMessages, universesExplored, historianEvents, stability };
}

function countNewMemories(prev: MemorySnapshot, current: MemorySnapshot): number {
  return (
    Math.max(0, current.transmissionMessages - prev.transmissionMessages) +
    Math.max(0, current.councilMessages - prev.councilMessages) +
    Math.max(0, current.universesExplored - prev.universesExplored) +
    Math.max(0, current.historianEvents - prev.historianEvents)
  );
}

export default function Chronicle({ state, transitionTo, updateState }: Props) {
  const finalChoice = state.selectedUniverse;
  const universe = finalChoice ? getUniverse(finalChoice) : null;
  const accent = universe?.color || VIOLET;

  const editions = state.chronicleEditions || [];
  const latestEdition = editions[editions.length - 1] ?? null;
  const editionNumber = editions.length + 1;

  const currentSnapshot = computeSnapshot(state);
  const newMemoryCount = latestEdition
    ? countNewMemories(latestEdition.memorySnapshot, currentSnapshot)
    : NEW_EDITION_THRESHOLD;
  const canGenerateNew = newMemoryCount >= NEW_EDITION_THRESHOLD;

  // View state: "generate" | "reading" | "shelf"
  const [view, setView] = useState<"generate" | "reading" | "shelf">(
    latestEdition ? "reading" : "generate"
  );
  const [readingEdition, setReadingEdition] = useState<ChronicleEdition | null>(latestEdition);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInit = useRef(false);

  // Auto-generate first edition on mount if none exist
  useEffect(() => {
    if (!state.resumeAnalysis || !finalChoice) { transitionTo("universe-discovery"); return; }
    if (editions.length > 0) return;
    if (hasInit.current) return;
    hasInit.current = true;
    runGenerate();
  }, []);

  const runGenerate = async () => {
    if (!state.resumeAnalysis || !finalChoice) return;
    setGenerating(true);
    setError(null);
    try {
      const names: Partial<Record<UniverseType, string>> = {};
      Object.entries(state.allProfiles || {}).forEach(([k, p]) => {
        if (p) names[k as UniverseType] = (p as any).alternativeName;
      });

      const previousEditions = editions.map(e => ({
        editionNumber: e.editionNumber,
        title: e.title,
        epilogue: e.epilogue,
      }));

      const res = await generateChronicle({
        resumeAnalysis: state.resumeAnalysis!,
        historianLog: [],
        finalChoice: finalChoice!,
        allCharacterNames: names,
        editionNumber,
        previousEditions: previousEditions.length ? previousEditions : undefined,
      });

      const newEdition: ChronicleEdition = {
        id: `chronicle_${Date.now()}`,
        editionNumber,
        generatedAt: Date.now(),
        title: res.title as string,
        prologue: res.prologue as string,
        chapters: res.chapters as ChronicleEdition["chapters"],
        epilogue: res.epilogue as string,
        universeId: finalChoice!,
        memorySnapshot: currentSnapshot,
      };

      const updatedEditions = [...editions, newEdition];
      updateState({ chronicleEditions: updatedEditions });
      setReadingEdition(newEdition);
      setView("reading");
    } catch (e: any) {
      setError(e.message || "The Historian could not record this edition.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${accent}12, transparent 55%), var(--bg)` }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("council-of-selves")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          {editions.length > 0 && (
            <button onClick={() => setView("shelf")}
              style={{ background: "none", border: `1px solid var(--border)`, borderRadius: 8, color: "var(--text2)", cursor: "pointer", fontSize: 12, padding: "4px 12px", fontFamily: "Sora, sans-serif" }}>
              All Editions ({editions.length})
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence mode="wait">

        {/* ── Generating state ── */}
        {generating && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 680, margin: "0 auto", padding: "120px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 24, animation: "pulse-glow 2s infinite" }}>📖</div>
            <p style={{ fontSize: 18, color: "var(--text2)", marginBottom: 8 }}>
              The Historian is recording{editionNumber > 1 ? ` Edition ${toRoman(editionNumber)}` : " your chronicle"}...
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>
              Comparing timelines. Preserving memories. This takes a moment.
            </p>
          </motion.div>
        )}

        {/* ── Error state ── */}
        {!generating && error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 680, margin: "0 auto", padding: "80px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
            <p style={{ color: "var(--rose2)", marginBottom: 24 }}>{error}</p>
            <NavButton onClick={runGenerate} accent={accent}>Try Again</NavButton>
          </motion.div>
        )}

        {/* ── Shelf: all editions ── */}
        {!generating && !error && view === "shelf" && (
          <motion.div key="shelf" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 680, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
              The Historian's Archive
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 40 }}>Chronicle Editions</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {editions.map((ed) => (
                <motion.div key={ed.id} whileHover={{ x: 4 }}
                  onClick={() => { setReadingEdition(ed); setView("reading"); }}
                  style={{ padding: "20px 24px", border: "1px solid var(--border)", borderRadius: 12,
                    background: "var(--bg2)", cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>
                      Chronicle · Edition {toRoman(ed.editionNumber)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>
                      {new Date(ed.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 20, fontStyle: "italic", color: "var(--text)", margin: 0 }}>
                    {ed.title}
                  </p>
                </motion.div>
              ))}
            </div>

            {canGenerateNew && (
              <div style={{ marginTop: 32, textAlign: "center" }}>
                <NavButton onClick={() => { setView("generate"); runGenerate(); }} accent={accent}>
                  Generate Edition {toRoman(editionNumber)} →
                </NavButton>
                <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 10 }}>
                  {newMemoryCount} new memories recorded since your last edition
                </p>
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button onClick={() => setView("reading")} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif" }}>
                ← Back to reading
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Reading an edition ── */}
        {!generating && !error && view === "reading" && readingEdition && (
          <motion.div key={`reading-${readingEdition.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 680, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>

            {/* Edition header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", marginBottom: 56, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>
                {universe?.emoji} Chronicle · Edition {toRoman(readingEdition.editionNumber)}
              </p>
              <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16, letterSpacing: "0.06em" }}>
                A volume in an ongoing saga · {new Date(readingEdition.generatedAt).toLocaleDateString()}
              </p>
              <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: 40, fontWeight: 400, fontStyle: "italic", letterSpacing: "-1px", color: "var(--text)", lineHeight: 1.2 }}>
                {readingEdition.title}
              </h1>
            </motion.div>

            {readingEdition.prologue && (
              <Section title="Prologue" body={readingEdition.prologue} accent={accent} delay={0.1} />
            )}
            {(readingEdition.chapters || []).map((ch, i) => (
              <Section key={i} title={`Chapter ${ch.number || i + 1} · ${ch.title}`} body={ch.content} accent={accent} delay={0.15 + i * 0.05} />
            ))}
            {readingEdition.epilogue && (
              <Section title="Epilogue" body={readingEdition.epilogue} accent={accent} delay={0.25} />
            )}

            {/* Post-reading actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ marginTop: 64, padding: "32px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📖</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Chronicle Recorded</p>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>
                The Historian has preserved this edition of your journey. The multiverse remains open.
                New choices, new timelines, and new discoveries may one day require a revised edition.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                <NavButton onClick={() => transitionTo("universe-discovery")} accent={accent}>
                  Continue Exploring
                </NavButton>

                {canGenerateNew ? (
                  <NavButton onClick={runGenerate} accent={accent} secondary>
                    Generate Edition {toRoman(editionNumber)}
                    <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>({newMemoryCount} new memories)</span>
                  </NavButton>
                ) : (
                  <div style={{ padding: "10px 18px", border: "1px dashed var(--border)", borderRadius: 8,
                    fontSize: 13, color: "var(--text3)", cursor: "default" }}>
                    Next edition unlocks in {NEW_EDITION_THRESHOLD - newMemoryCount} more memories
                  </div>
                )}

                {editions.length > 1 && (
                  <NavButton onClick={() => setView("shelf")} accent={accent} secondary>
                    View All Editions
                  </NavButton>
                )}
              </div>
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function Section({ title, body, accent, delay }: { title: string; body: string; accent: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ width: 3, height: 16, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{title}</span>
      </div>
      <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 19, lineHeight: 1.9, color: "var(--text)", fontWeight: 300, whiteSpace: "pre-wrap" }}>
        {clean(body)}
      </p>
    </motion.div>
  );
}

function NavButton({ onClick, accent, secondary, children }: {
  onClick: () => void; accent: string; secondary?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 20px", borderRadius: 8, border: secondary ? `1px solid ${accent}55` : "none",
      background: secondary ? "transparent" : accent,
      color: secondary ? accent : "#fff",
      fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center",
    }}>
      {children}
    </button>
  );
}
