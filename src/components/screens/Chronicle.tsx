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
const NEW_EDITION_THRESHOLD = 5;

const CREAM = "#f5f0e8";
const CREAM2 = "#ede8dc";
const INK = "#1a1510";
const INK2 = "#3d3528";
const SPINE_COLOR = "#2a1f0e";

function toRoman(n: number): string {
  const romans = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[n] ?? String(n);
}

function computeSnapshot(state: AppState): MemorySnapshot {
  const transmissionMessages = Object.values(state.transmissions || {}).reduce(
    (acc, t) => acc + (t.messages?.length ?? 0), 0
  );
  return {
    transmissionMessages,
    councilMessages: (state.councilMessages || []).length,
    universesExplored: (state.explored || []).length,
    historianEvents: (state.historianLog || []).length,
    stability: state.timelineState.stability,
  };
}

function countNewMemories(prev: MemorySnapshot, current: MemorySnapshot): number {
  return (
    Math.max(0, current.transmissionMessages - prev.transmissionMessages) +
    Math.max(0, current.councilMessages - prev.councilMessages) +
    Math.max(0, current.universesExplored - prev.universesExplored) +
    Math.max(0, current.historianEvents - prev.historianEvents)
  );
}

type BookPage =
  | { kind: "cover"; edition: ChronicleEdition; accent: string }
  | { kind: "section"; label: string; body: string; pageNum: number; totalPages: number }
  | { kind: "back"; edition: ChronicleEdition; canGenerateNew: boolean; newMemoryCount: number; editionNumber: number; accent: string };

function buildPages(edition: ChronicleEdition, accent: string, canGenerateNew: boolean, newMemoryCount: number, nextEditionNumber: number): BookPage[] {
  const pages: BookPage[] = [];
  pages.push({ kind: "cover", edition, accent });

  const sections: { label: string; body: string }[] = [];
  if (edition.prologue) sections.push({ label: "Prologue", body: edition.prologue });
  (edition.chapters || []).forEach((ch, i) =>
    sections.push({ label: `Chapter ${ch.number || i + 1} · ${ch.title}`, body: ch.content })
  );
  if (edition.epilogue) sections.push({ label: "Epilogue", body: edition.epilogue });

  sections.forEach((s, i) =>
    pages.push({ kind: "section", label: s.label, body: s.body, pageNum: i + 1, totalPages: sections.length })
  );

  pages.push({ kind: "back", edition, canGenerateNew, newMemoryCount, editionNumber: nextEditionNumber, accent });
  return pages;
}

export default function Chronicle({ state, transitionTo, updateState }: Props) {
  const finalChoice = state.selectedUniverse;
  const universe = finalChoice ? getUniverse(finalChoice) : null;
  const accent = universe?.color || "#7c6ef7";

  const editions = state.chronicleEditions || [];
  const latestEdition = editions[editions.length - 1] ?? null;
  const editionNumber = editions.length + 1;

  const currentSnapshot = computeSnapshot(state);
  const newMemoryCount = latestEdition
    ? countNewMemories(latestEdition.memorySnapshot, currentSnapshot)
    : NEW_EDITION_THRESHOLD;
  const canGenerateNew = newMemoryCount >= NEW_EDITION_THRESHOLD;

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingEdition, setViewingEdition] = useState<ChronicleEdition | null>(latestEdition);
  const [showShelf, setShowShelf] = useState(editions.length > 0);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipDir, setFlipDir] = useState(1);
  const hasInit = useRef(false);

  const pages = viewingEdition
    ? buildPages(viewingEdition, accent, canGenerateNew, newMemoryCount, editionNumber)
    : [];

  const goTo = (idx: number) => {
    const dir = idx > pageIndex ? 1 : -1;
    setFlipDir(dir);
    setPageIndex(Math.max(0, Math.min(idx, pages.length - 1)));
  };

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
    setPageIndex(0);
    try {
      const names: Partial<Record<UniverseType, string>> = {};
      Object.entries(state.allProfiles || {}).forEach(([k, p]) => {
        if (p) names[k as UniverseType] = (p as any).alternativeName;
      });

      const previousEditions = editions.map(e => ({ editionNumber: e.editionNumber, title: e.title, epilogue: e.epilogue }));
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
      setViewingEdition(newEdition);
    } catch (e: any) {
      setError(e.message || "The Historian could not record this edition.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "#0e0c09",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 16px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 50%, ${accent}08 0%, transparent 65%)` }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px",
        background: "rgba(14,12,9,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid #2a2520" }}>
        <button onClick={() => transitionTo("council-of-selves")}
          style={{ background: "none", border: "none", color: "#8a7a6a", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, color: "#f5f0e8", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: accent }}>Out</span>
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {editions.length > 0 && (
            <button onClick={() => setShowShelf(s => !s)} style={{
              background: "none", border: "1px solid #3a3020", borderRadius: 8,
              color: "#8a7a6a", cursor: "pointer", fontSize: 12, padding: "5px 14px", fontFamily: "Sora, sans-serif",
            }}>
              {showShelf ? "← Reading" : `Archive (${editions.length})`}
            </button>
          )}
        </div>
      </nav>

      {/* ── Generating ── */}
      {generating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 24, filter: "sepia(0.8)" }}>📖</div>
          <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 22, color: CREAM2, marginBottom: 8 }}>
            The Historian is recording{editionNumber > 1 ? ` Edition ${toRoman(editionNumber)}` : " your chronicle"}...
          </p>
          <p style={{ fontSize: 13, color: "#6a5a4a" }}>Comparing timelines. Preserving memories.</p>
        </motion.div>
      )}

      {/* ── Error ── */}
      {!generating && error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <p style={{ color: "#c0504a", marginBottom: 24, fontFamily: "Sora, sans-serif" }}>{error}</p>
          <BookButton onClick={runGenerate} accent={accent}>Try Again</BookButton>
        </motion.div>
      )}

      {/* ── Edition Shelf ── */}
      {!generating && !error && showShelf && (
        <motion.div key="shelf" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Archive header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ height: 1, width: 48, background: `linear-gradient(to right, transparent, ${accent}66)` }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 8h6M9 12h6" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ height: 1, width: 48, background: `linear-gradient(to left, transparent, ${accent}66)` }} />
            </div>
            <h2 style={{ fontFamily: "Crimson Pro, serif", fontSize: 32, fontStyle: "italic", fontWeight: 400, color: CREAM, marginBottom: 6 }}>
              The Historian&apos;s Archive
            </h2>
            <p style={{ fontSize: 12, color: "#6a5a4a", letterSpacing: "0.08em", fontFamily: "Sora, sans-serif" }}>
              {editions.length} {editions.length === 1 ? "edition" : "editions"} preserved
            </p>
          </div>

          {/* Edition list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {editions.map((ed, idx) => (
              <motion.div key={ed.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.35, ease: "easeOut" }}
                whileHover={{ x: 5 }}
                onClick={() => { setViewingEdition(ed); setPageIndex(0); setShowShelf(false); }}
                style={{ padding: "20px 26px", border: "1px solid #3a3020", borderRadius: 10,
                  background: "linear-gradient(135deg, #1a1510 0%, #130f09 100%)",
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.boxShadow = `0 4px 24px -8px ${accent}33`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a3020"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}15`, border: `1px solid ${accent}33`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent, fontFamily: "Sora, sans-serif" }}>
                      {toRoman(ed.editionNumber)}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: `${accent}aa`, marginBottom: 4, fontFamily: "Sora, sans-serif" }}>
                      Edition {toRoman(ed.editionNumber)}
                    </p>
                    <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 18, fontStyle: "italic", color: CREAM, lineHeight: 1.3 }}>{ed.title}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#6a5a4a", fontFamily: "Sora, sans-serif" }}>
                    {new Date(ed.generatedAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: 10, color: `${accent}77`, fontFamily: "Sora, sans-serif" }}>Read →</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Record new edition CTA */}
          <div style={{ marginTop: 36, textAlign: "center", width: "100%" }}>
            {canGenerateNew ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <ArchiveRecordButton
                  onClick={() => { setShowShelf(false); runGenerate(); }}
                  accent={accent}
                  editionLabel={`Record Edition ${toRoman(editionNumber)}`}
                  memoryCount={newMemoryCount}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 22px",
                  border: "1px solid #3a3020", borderRadius: 10, background: "#130f09" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#6a5a4a" strokeWidth="1.5"/>
                  <path d="M12 8v5l3 3" stroke="#6a5a4a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: 12, color: "#6a5a4a", fontFamily: "Sora, sans-serif" }}>
                  Next edition in {NEW_EDITION_THRESHOLD - newMemoryCount} more memories
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Book ── */}
      {!generating && !error && !showShelf && viewingEdition && pages.length > 0 && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

          {/* Book container */}
          <div style={{
            position: "relative",
            width: "min(860px, 96vw)",
            perspective: "2400px",
          }}>
            {/* Book shadow */}
            <div style={{
              position: "absolute", bottom: -20, left: "8%", right: "8%", height: 30,
              background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)",
              filter: "blur(8px)", zIndex: 0,
            }} />

            {/* Book body */}
            <div style={{
              position: "relative", zIndex: 1,
              display: "flex",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px #3a3020",
              borderRadius: "4px 12px 12px 4px",
            }}>
              {/* Spine */}
              <div style={{
                width: 28, flexShrink: 0,
                background: `linear-gradient(to right, ${SPINE_COLOR}, #3a2e1a 40%, #2a1f0e)`,
                borderRadius: "4px 0 0 4px",
                boxShadow: "inset -3px 0 8px rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  writingMode: "vertical-lr", transform: "rotate(180deg)",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#8a7060", fontFamily: "Sora, sans-serif",
                }}>
                  Chronicle · Ed. {toRoman(viewingEdition.editionNumber)}
                </span>
              </div>

              {/* Page area */}
              <div style={{ flex: 1, overflow: "hidden", position: "relative", borderRadius: "0 12px 12px 0" }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pageIndex}
                    initial={{ rotateY: flipDir > 0 ? 60 : -60, opacity: 0, x: flipDir > 0 ? 40 : -40 }}
                    animate={{ rotateY: 0, opacity: 1, x: 0 }}
                    exit={{ rotateY: flipDir > 0 ? -60 : 60, opacity: 0, x: flipDir > 0 ? -40 : 40 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      transformOrigin: flipDir > 0 ? "left center" : "right center",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <PageContent page={pages[pageIndex]} onAction={(action) => {
                      if (action === "continue") transitionTo("universe-discovery");
                      if (action === "generate") runGenerate();
                      if (action === "shelf") setShowShelf(true);
                    }} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button
              onClick={() => goTo(pageIndex - 1)}
              disabled={pageIndex === 0}
              aria-label="Previous page"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1px solid #3a3020", background: pageIndex === 0 ? "transparent" : "#1a1510",
                color: pageIndex === 0 ? "#3a3020" : CREAM2, cursor: pageIndex === 0 ? "default" : "pointer",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >‹</button>

            {/* Page dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {pages.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Go to page ${i + 1}`} style={{
                  width: i === pageIndex ? 20 : 6, height: 6, borderRadius: 3,
                  border: "none", cursor: "pointer", padding: 0,
                  background: i === pageIndex ? accent : "#3a3020",
                  transition: "all 0.25s ease",
                }} />
              ))}
            </div>

            <button
              onClick={() => goTo(pageIndex + 1)}
              disabled={pageIndex === pages.length - 1}
              aria-label="Next page"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1px solid #3a3020", background: pageIndex === pages.length - 1 ? "transparent" : "#1a1510",
                color: pageIndex === pages.length - 1 ? "#3a3020" : CREAM2,
                cursor: pageIndex === pages.length - 1 ? "default" : "pointer",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >›</button>
          </div>

          {/* Keyboard hint */}
          <p style={{ fontSize: 11, color: "#4a3a2a", fontFamily: "Sora, sans-serif" }}>
            Use ‹ › to flip pages · {pageIndex + 1} of {pages.length}
          </p>
        </div>
      )}
    </div>
  );
}

function PageContent({ page, onAction }: { page: BookPage; onAction: (action: string) => void }) {
  const pageStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM2} 100%)`,
    minHeight: "min(560px, 72vh)",
    padding: "48px 52px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  if (page.kind === "cover") {
    return (
      <div style={{ ...pageStyle, justifyContent: "center", alignItems: "center", textAlign: "center",
        background: `linear-gradient(145deg, #2a1f0e 0%, #1a1208 50%, #0e0c09 100%)`,
        borderRight: "none" }}>
        {/* Decorative frame */}
        <div style={{ position: "absolute", inset: 20, border: `1px solid ${page.accent}33`, borderRadius: 4, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 26, border: `1px solid ${page.accent}18`, borderRadius: 2, pointerEvents: "none" }} />

        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
          color: page.accent, marginBottom: 20, fontFamily: "Sora, sans-serif", opacity: 0.9 }}>
          The Multiversal Chronicle
        </p>
        <div style={{ width: 40, height: 1, background: `${page.accent}66`, margin: "0 auto 24px" }} />
        <h1 style={{ fontFamily: "Crimson Pro, serif", fontSize: "clamp(22px, 3.5vw, 34px)",
          fontWeight: 400, fontStyle: "italic", color: CREAM, lineHeight: 1.3, marginBottom: 24, maxWidth: 400 }}>
          {page.edition.title}
        </h1>
        <div style={{ width: 40, height: 1, background: `${page.accent}66`, margin: "0 auto 20px" }} />
        <p style={{ fontSize: 12, color: "#8a7060", letterSpacing: "0.1em", fontFamily: "Sora, sans-serif" }}>
          Edition {toRoman(page.edition.editionNumber)} · {new Date(page.edition.generatedAt).toLocaleDateString()}
        </p>
        <p style={{ fontSize: 11, color: "#5a4a3a", marginTop: 8, fontFamily: "Sora, sans-serif" }}>
          A volume in an ongoing saga
        </p>
      </div>
    );
  }

  if (page.kind === "back") {
    return (
      <div style={{ ...pageStyle, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 20, border: `1px solid ${INK}15`, borderRadius: 4, pointerEvents: "none" }} />

        <p style={{ fontSize: 22, marginBottom: 16, filter: "sepia(0.5)" }}>📖</p>
        <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 22, fontStyle: "italic", color: INK, marginBottom: 8 }}>
          Chronicle Recorded
        </p>
        <p style={{ fontSize: 13, color: INK2, lineHeight: 1.7, marginBottom: 28, maxWidth: 380 }}>
          The Historian has preserved Edition {toRoman(page.edition.editionNumber)}. The multiverse remains open.
          New choices and discoveries may one day call for a revised edition.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          <BackPageButton
            onClick={() => onAction("continue")}
            variant="primary"
            accent={page.accent}
            label="Continue Exploring"
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />

          {page.canGenerateNew ? (
            <BackPageButton
              onClick={() => onAction("generate")}
              variant="quill"
              accent={page.accent}
              label={`Record Edition ${toRoman(page.editionNumber)}`}
              sub={`${page.newMemoryCount} new memories`}
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 3C20 3 14 5 12 12L9 15l-1 4 4-1 3-3c7-2 9-8 9-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 20l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 16px", border: `1px solid ${INK}20`, borderRadius: 8, background: `${INK}06` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#8a7060" strokeWidth="1.5"/>
                <path d="M12 8v5l3 3" stroke="#8a7060" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 11, color: "#8a7060", fontFamily: "Sora, sans-serif", margin: 0 }}>
                Next edition in {NEW_EDITION_THRESHOLD - page.newMemoryCount} more memories
              </p>
            </div>
          )}

          <BackPageButton
            onClick={() => onAction("shelf")}
            variant="ghost"
            accent={page.accent}
            label="View All Editions"
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
        </div>

        <p style={{ position: "absolute", bottom: 24, fontSize: 10, color: "#b0a090", letterSpacing: "0.1em",
          fontFamily: "Sora, sans-serif", textTransform: "uppercase" }}>
          — The Historian never writes The End —
        </p>
      </div>
    );
  }

  // Section page
  return (
    <div style={pageStyle}>
      {/* Paper texture grain overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ width: 3, height: 18, borderRadius: 2, background: INK2, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: INK2, fontFamily: "Sora, sans-serif" }}>{page.label}</span>
      </div>

      {/* Body text */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{
          fontFamily: "Crimson Pro, serif",
          fontSize: "clamp(16px, 2.2vw, 19px)",
          lineHeight: 1.85,
          color: INK,
          fontWeight: 300,
          whiteSpace: "pre-wrap",
          display: "-webkit-box",
          WebkitLineClamp: 18,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {clean(page.body)}
        </p>
      </div>

      {/* Page number */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: `1px solid ${INK}18`, paddingTop: 16, marginTop: 20 }}>
        <span style={{ fontSize: 10, color: "#8a7060", fontFamily: "Sora, sans-serif" }}>
          Chronicle · Edition {toRoman((page as any).edition?.editionNumber ?? 1)}
        </span>
        <span style={{ fontSize: 11, color: "#8a7060", fontFamily: "Crimson Pro, serif", fontStyle: "italic" }}>
          {page.pageNum} / {page.totalPages}
        </span>
      </div>
    </div>
  );
}

function BookButton({ onClick, accent, children }: { onClick: () => void; accent: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 22px", borderRadius: 8, border: "none",
      background: accent, color: "#fff",
      fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
    }}>{children}</button>
  );
}

function BackPageButton({ onClick, variant, accent, label, sub, icon }: {
  onClick: () => void;
  variant: "primary" | "quill" | "ghost";
  accent: string;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const styles: React.CSSProperties = variant === "primary" ? {
    padding: "12px 20px",
    background: hovered ? INK : `${INK}ee`,
    border: `1px solid ${INK}`,
    borderRadius: 9,
    color: CREAM,
    boxShadow: hovered ? `0 4px 16px -4px rgba(0,0,0,0.35)` : `0 2px 8px -2px rgba(0,0,0,0.2)`,
  } : variant === "quill" ? {
    padding: "12px 20px",
    background: hovered ? `${accent}18` : "transparent",
    border: `1px solid ${hovered ? accent : `${accent}55`}`,
    borderRadius: 9,
    color: hovered ? accent : INK2,
    boxShadow: hovered ? `0 0 20px -6px ${accent}44` : "none",
  } : {
    padding: "11px 20px",
    background: hovered ? `${INK}08` : "transparent",
    border: `1px solid ${hovered ? `${INK}40` : `${INK}20`}`,
    borderRadius: 9,
    color: hovered ? INK : "#8a7060",
    boxShadow: "none",
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles,
        width: "100%", cursor: "pointer",
        fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.22s ease",
      }}
    >
      {icon && <span style={{ display: "flex", opacity: hovered ? 1 : 0.7, transition: "opacity 0.2s" }}>{icon}</span>}
      <span>{label}</span>
      {sub && (
        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6, marginLeft: 2 }}>({sub})</span>
      )}
    </button>
  );
}

function ArchiveRecordButton({ onClick, accent, editionLabel, memoryCount }: {
  onClick: () => void; accent: string; editionLabel: string; memoryCount: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative", padding: "14px 32px", borderRadius: 10, cursor: "pointer", overflow: "hidden",
          background: hovered ? `${accent}18` : "linear-gradient(135deg, #1e180e 0%, #150f07 100%)",
          border: `1px solid ${hovered ? accent : `${accent}55`}`,
          boxShadow: hovered ? `0 0 28px -6px ${accent}55, inset 0 1px 0 ${accent}22` : `0 2px 12px -4px rgba(0,0,0,0.6), inset 0 1px 0 ${accent}11`,
          transition: "all 0.3s ease",
          display: "flex", alignItems: "center", gap: 12,
        }}
      >
        {/* Quill icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: hovered ? 1 : 0.7, transition: "opacity 0.2s" }}>
          <path d="M20 3C20 3 14 5 12 12L9 15l-1 4 4-1 3-3c7-2 9-8 9-8z" stroke={accent} strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M4 20l4-4" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: "Crimson Pro, serif", fontSize: 18, fontStyle: "italic", fontWeight: 400,
          color: hovered ? accent : CREAM2, letterSpacing: "0.02em", transition: "color 0.25s",
        }}>
          {editionLabel}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: hovered ? `${accent}cc` : "#6a5a4a", fontFamily: "Sora, sans-serif", transition: "color 0.25s",
        }}>→</span>
      </button>
      <p style={{ fontSize: 11, color: "#5a4a3a", fontFamily: "Sora, sans-serif", letterSpacing: "0.04em" }}>
        {memoryCount} new memories since last edition
      </p>
    </div>
  );
}
