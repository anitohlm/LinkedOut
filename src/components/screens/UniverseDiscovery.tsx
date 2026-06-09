"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getAllUniverses } from "@/lib/universes";
import { StabilityHUD } from "@/components/StabilityHUD";
import { UNIVERSE_ACTIVITIES, universePercent } from "@/lib/progress";
import { applyEvent } from "@/lib/stability";
import { H, logEntry } from "@/lib/historian";
import UniverseArtwork from "@/components/UniverseArtwork";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}


// Immersive progress label — per universe flavour text (spec item #4)
const RESONANCE_LABELS: Record<string, string> = {
  medieval:  "Fate Convergence",
  cyberpunk: "Reality Alignment",
  pirate:    "Tidal Resonance",
  dragon:    "Ancient Attunement",
  galactic:  "World Synchronization",
  vampire:   "Timeline Resonance",
};

// Universe-specific typography for the world name heading (spec item #8)
const WORLD_TITLE_STYLE: Record<string, React.CSSProperties> = {
  medieval:  { fontFamily: "'Cinzel', serif", letterSpacing: "0.14em" },
  cyberpunk: { fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" },
  pirate:    { fontFamily: "'Sora', sans-serif", fontStyle: "italic", letterSpacing: "0.02em" },
  dragon:    { fontFamily: "'Cinzel Decorative', serif", letterSpacing: "0.1em" },
  galactic:  { fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.08em" },
  vampire:   { fontFamily: "'Crimson Pro', serif", fontStyle: "italic", letterSpacing: "0.06em" },
};


export default function UniverseDiscovery({ state, transitionTo, updateState }: Props) {
  const universes = getAllUniverses();
  const profileCount = Object.keys(state.allProfiles || {}).length;
  const allReady = profileCount === universes.length;

  const explored = state.explored || [];
  const exploredCount = explored.length;
  const phase1Done = exploredCount >= universes.length;
  const phase2Unlocked = phase1Done;
  const phase2Done = !!state.usedButterfly;
  const phase3Unlocked = phase2Done;

  const hasChronicle = (state.chronicleEditions?.length ?? 0) > 0;
  const latestEdition = state.chronicleEditions?.[state.chronicleEditions.length - 1];
  const phase3Done = !!state.selectedUniverse;
  const phase4Unlocked = phase3Done || hasChronicle;
  const phase4Done = hasChronicle;
  const currentPhase = !phase1Done ? 1 : !phase2Done ? 2 : !phase3Done ? 3 : 4;

  // ── Chronicle unlock notification ──────────────────────────────────────────
  const NOTIF_KEY = "linkedout_chronicle_unlocked_seen";
  const [showChronicleNotif, setShowChronicleNotif] = useState(false);
  const [hoveredUniverse, setHoveredUniverse] = useState<string | null>(null);
  const prevPhase4Unlocked = useRef(phase4Unlocked);

  useEffect(() => {
    // Only fire when it transitions false → true and hasn't been shown before
    if (phase4Unlocked && !prevPhase4Unlocked.current) {
      if (!localStorage.getItem(NOTIF_KEY)) {
        setShowChronicleNotif(true);
      }
    }
    prevPhase4Unlocked.current = phase4Unlocked;
  }, [phase4Unlocked]);

  // Also show on mount if already unlocked but never seen
  useEffect(() => {
    if (phase4Unlocked && !localStorage.getItem(NOTIF_KEY)) {
      setShowChronicleNotif(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissChronicleNotif = () => {
    localStorage.setItem(NOTIF_KEY, "1");
    setShowChronicleNotif(false);
  };
  // ───────────────────────────────────────────────────────────────────────────

  const explore = (id: UniverseType) => {
    const next = Array.from(new Set([...explored, id]));
    const bonusGiven = state.completionBonusGiven || [];
    const isFirstVisit = !explored.includes(id);
    if (isFirstVisit && !bonusGiven.includes(id)) {
      const prevStab = state.timelineState.stability;
      const { stability, status, event } = applyEvent(prevStab, "universe-completion");
      const gain = stability - prevStab;
      const universeName = universes.find(u => u.id === id)?.title ?? id;
      logEntry(H.universeEntered(universeName, gain), state, updateState, {
        toast: true,
        extra: {
          timelineState: { stability, status },
          stabilityMessage: event.message,
          completionBonusGiven: [...bonusGiven, id],
        },
      });
    }
    transitionTo("identity-reconstruction", { selectedUniverse: id, explored: next });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>

      {/* ── Chronicle Unlock Notification ─────────────────────────────────── */}
      <AnimatePresence>
        {showChronicleNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(4,5,8,0.82)", backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
            onClick={dismissChronicleNotif}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 480,
                background: "rgba(10,11,16,0.98)",
                border: "1px solid #e8c97e44",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 32px 80px -16px rgba(0,0,0,0.9), 0 0 0 1px #e8c97e18, inset 0 1px 0 #e8c97e22",
              }}
            >
              {/* Gold top bar */}
              <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #e8c97e, transparent)" }} />

              {/* Body */}
              <div style={{ padding: "36px 36px 32px" }}>
                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16, marginBottom: 24,
                  background: "rgba(232,201,126,0.1)", border: "1px solid #e8c97e33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <polygon points="12,2 15,9 22,9.5 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.5 9,9" stroke="#e8c97e" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(232,201,126,0.15)"/>
                  </svg>
                </div>

                {/* Eyebrow */}
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e8c97e99", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>
                  Phase IV Unlocked
                </p>

                {/* Headline */}
                <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "#e8c97e", marginBottom: 12, lineHeight: 1.2, fontFamily: "Sora, sans-serif" }}>
                  The Historian's Chronicle
                </h2>

                {/* Lore */}
                <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, marginBottom: 28, fontFamily: "Crimson Pro, serif", fontStyle: "italic" }}>
                  Your journey across the multiverse has been witnessed. The Historian stands ready to record it — preserved in ink and memory, across every timeline you've touched.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => { dismissChronicleNotif(); transitionTo("chronicle"); }}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 12, cursor: "pointer",
                      background: "linear-gradient(135deg, #e8c97e, #c9a85c)",
                      border: "none", color: "#0a0b10", fontSize: 14, fontWeight: 700,
                      fontFamily: "Sora, sans-serif", letterSpacing: "0.02em",
                      boxShadow: "0 8px 24px -8px #e8c97e60",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Open the Chronicle
                  </button>
                  <button
                    onClick={dismissChronicleNotif}
                    style={{
                      padding: "13px 20px", borderRadius: 12, cursor: "pointer",
                      background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      color: "var(--text3)", fontSize: 14, fontFamily: "Sora, sans-serif",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
                  >
                    Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ──────────────────────────────────────────────────────────────────── */}

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => {
            if (!confirm("Start over with a new resume? This clears your current multiverse.")) return;
            try { localStorage.removeItem("linkedout_save_v1"); } catch {}
            transitionTo("upload-resume", {
              resumeText: null, resumeAnalysis: null, selectedUniverse: null,
              allProfiles: {} as any, allFutureSelves: {} as any, conversations: {} as any,
              timelineState: { stability: 100, status: "stable" }, explored: [], usedButterfly: false,
            });
          }}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500,
            cursor: "pointer", background: "none", border: "none", color: "var(--text2)", fontFamily: "Sora, sans-serif" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
        >
          ↻ New Resume
        </button>
        <button onClick={() => transitionTo("landing")} style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px",
          background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </button>
        {/* Stability HUD only once the multiverse is actually built */}
        {allReady
          ? <StabilityHUD stability={state.timelineState.stability} log={state.historianLog} stabilityLog={state.stabilityLog} />
          : <span style={{ width: 50 }} />}
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
            Your Multiverse Journey
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
            Meet the people you could have become.
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
            {state.resumeAnalysis?.timelineSignature}
          </p>
        </motion.div>

        {/* Phase tracker */}
        {allReady && (
          <PhaseTracker
            current={currentPhase}
            collapsed={!!state.journeyCollapsed}
            onToggle={() => updateState({ journeyCollapsed: !state.journeyCollapsed })}
            steps={[
            { n: 1, label: "Explore Your Selves", sub: exploredCount >= universes.length ? `${exploredCount}/6 Explored` : `${exploredCount}/6 explored`,
              desc: "Meet all six alternate-universe versions of yourself and see who you could have become." },
            { n: 2, label: "The Butterfly Effect", sub: phase2Done ? "Done" : phase2Unlocked ? "Unlocked" : "Locked",
              desc: "Change one decision and watch your life fracture across four alternate timelines." },
            { n: 3, label: "The Council of Selves", sub: phase3Done ? "Done" : phase3Unlocked ? "Unlocked" : "Locked",
              desc: "Gather every version of you to debate — then choose the future you're willing to become." },
            { n: 4, label: "The Historian's Chronicle", sub: phase4Done ? `${state.chronicleEditions!.length} edition${state.chronicleEditions!.length !== 1 ? "s" : ""}` : phase4Unlocked ? "Unlocked" : "Locked",
              desc: "The Historian records your journey across the multiverse — preserved forever in ink and memory." },
          ]} />
        )}

        {!allReady && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
            Loading universes...
          </div>
        )}

        {/* ── PHASE 1: EXPLORE ── */}
        {allReady && (
          <>
            <PhaseHeading n={1} active={currentPhase === 1} done={phase1Done}
              title="Explore Your Selves"
              sub={phase1Done ? "Every reality witnessed. Your timeline is ready to fracture." : `Open all six to understand who you could become. ${exploredCount} of 6 explored.`}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, perspective: "1200px", marginBottom: 56 }}>
              {universes.map((universe, i) => {
                const profile = state.allProfiles?.[universe.id];
                const c = universe.color;
                const visited = explored.includes(universe.id);
                const acceptedPos = (state.acceptedPositions || []).find(p => p.universeId === universe.id);
                const cardTitle = acceptedPos?.title ?? profile?.profession;
                const activities = state.universeActivity?.[universe.id] || [];
                const pct = universePercent(activities);
                return (
                  <motion.div
                    key={universe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => explore(universe.id)}
                    whileHover={{ y: -6, rotateX: 3, rotateY: -3, scale: 1.02 }}
                    style={{
                      background: "var(--bg2)", border: `1px solid ${visited ? c + "44" : "var(--border)"}`,
                      borderRadius: 20, padding: 0, cursor: "pointer", position: "relative", overflow: "hidden",
                      transformStyle: "preserve-3d",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${c}66`; el.style.boxShadow = `0 20px 60px -16px ${c}50`; setHoveredUniverse(universe.id); }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = visited ? `${c}44` : "var(--border)"; el.style.boxShadow = "none"; setHoveredUniverse(null); }}
                  >
                    {/* ── ARTWORK HEADER: atmospheric destination art ─────── */}
                    <UniverseArtwork id={universe.id} color={c} visited={visited} hovering={hoveredUniverse === universe.id} />

                    {/* Universe title pill — overlaid on artwork */}
                    <div style={{ position: "absolute", top: 14, right: 14, zIndex: 6 }}>
                      <span style={{
                        fontSize: 10, padding: "4px 10px", borderRadius: 100, fontWeight: 700,
                        background: `rgba(8,9,13,0.72)`, backdropFilter: "blur(8px)",
                        color: c, border: `1px solid ${c}${visited ? "55" : "30"}`,
                        display: "flex", alignItems: "center", gap: 5,
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>
                        {visited && (
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {universe.title}
                      </span>
                    </div>

                    {/* ── CARD CONTENT ─────────────────────────────────────── */}
                    <div style={{ padding: "18px 24px 24px" }}>
                      {profile ? (
                        <>
                          {/* 1. WORLD FIRST — name in universe typography, then era */}
                          <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
                            textTransform: "uppercase", color: c, marginBottom: 3,
                            lineHeight: 1.2,
                            ...(WORLD_TITLE_STYLE[universe.id] ?? {}),
                          }}>
                            {profile.worldName}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, letterSpacing: "0.03em" }}>
                            {profile.eraName}
                          </div>

                          {/* 2. CHARACTER — name then title */}
                          <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.25, marginBottom: 6, color: "var(--text)" }}>
                            {profile.alternativeName}
                          </h3>
                          <p style={{ fontSize: 13.5, color: c, fontWeight: 500, marginBottom: 14, lineHeight: 1.35 }}>{cardTitle}</p>

                          {/* 3. BIO — story preview */}
                          <p style={{ fontSize: 13.5, color: "var(--text3)", lineHeight: 1.65, margin: 0 }}>
                            {(profile.biography || "").replace(/\\n/g, " ").slice(0, 130)}…
                          </p>

                          {/* ── FOOTER ────────────────────────────────────── */}
                          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${c}1a` }}>

                            {/* Activity signals */}
                            {(() => {
                              const txMessages = (state.transmissions?.[universe.id]?.messages || []);
                              const txCount = txMessages.filter((m: any) => m.role === "assistant").length;
                              const hasLegendary = activities.includes("legendary");
                              const hasShadow = activities.includes("shadow");
                              const hasRecruiter = activities.includes("recruiter");
                              // SVG icon nodes per signal type (no emojis — ui-ux-pro-max §4 no-emoji-icons)
                              const SignalIcon = ({ type, color }: { type: string; color: string }) => {
                                if (type === "tx") return (
                                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="10" r="1.5" fill={color}/>
                                    <path d="M4.5 7.5a3.5 3.5 0 0 1 5 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
                                    <path d="M2.5 5.5a6 6 0 0 1 9 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
                                  </svg>
                                );
                                if (type === "legendary") return (
                                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 5h10l-1.5 6H3.5L2 5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
                                    <path d="M2 5L4 2h6l2 3" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
                                    <circle cx="7" cy="8" r="1.2" fill={color}/>
                                  </svg>
                                );
                                if (type === "shadow") return (
                                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.2"/>
                                    <path d="M7 2.5A4.5 4.5 0 0 0 7 11.5" fill={color} fillOpacity="0.4"/>
                                  </svg>
                                );
                                // offer/recruiter
                                return (
                                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                                    <rect x="2" y="3" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.2"/>
                                    <path d="M2 6h10" stroke={color} strokeWidth="1.2"/>
                                    <path d="M5 9h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
                                  </svg>
                                );
                              };
                              const signals = [
                                txCount > 0 && { type: "tx",         label: `${txCount} msg${txCount !== 1 ? "s" : ""}`, accent: c },
                                hasLegendary && { type: "legendary",  label: "Legendary",                                  accent: "#e8c97e" },
                                hasShadow    && { type: "shadow",     label: "Shadow",                                     accent: "#f07070" },
                                hasRecruiter && { type: "offer",      label: "Offer",                                      accent: c },
                              ].filter(Boolean) as { type: string; label: string; accent: string }[];
                              return signals.length > 0 ? (
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                  {signals.map((s, si) => (
                                    <span key={si} style={{
                                      fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                                      background: `${s.accent}14`, color: s.accent, border: `1px solid ${s.accent}30`,
                                      display: "flex", alignItems: "center", gap: 4,
                                    }}>
                                      <SignalIcon type={s.type} color={s.accent} />
                                      {s.label}
                                    </span>
                                  ))}
                                </div>
                              ) : null;
                            })()}

                            {/* Resonance label + percentage */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{
                                fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
                                letterSpacing: "0.1em", fontWeight: 600,
                              }}>
                                {RESONANCE_LABELS[universe.id] ?? "Resonance"}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? c : "var(--text2)", fontVariantNumeric: "tabular-nums" }}>
                                {pct}%{pct === 100 ? " ✦" : ""}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div style={{ height: 3, background: "var(--surface3)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                              <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
                                style={{ height: "100%", background: c, borderRadius: 4, boxShadow: pct > 0 ? `0 0 8px ${c}80` : "none" }} />
                            </div>

                            {/* Activity chips */}
                            <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                              {UNIVERSE_ACTIVITIES.map(a => (
                                <ActivityChip key={a.key} activity={a} done={activities.includes(a.key)} color={c} />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : <div style={{ color: "var(--text3)", fontSize: 13, padding: "8px 0" }}>Loading profile...</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── PHASE 2: WHAT IF ── */}
            <PhaseGate
              n={2}
              unlocked={phase2Unlocked}
              done={phase2Done}
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 12C10 8 4 6 2 9s2 7 6 6c-2 2-2 5 4 3" stroke="#7ee8e1" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 12C14 8 20 6 22 9s-2 7-6 6c2 2 2 5-4 3" stroke="#7ee8e1" strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="14" r="1.2" fill="#7ee8e1"/></svg>}
              color="#7ee8e1"
              title="The Butterfly Effect"
              sub="Change one decision. Watch your life fracture across four alternate timelines."
              lockedHint="Explore all six universes to unlock"
              cta={phase2Done ? "Revisit →" : "Begin →"}
              onClick={() => transitionTo("butterfly-effect")}
            />

            {/* ── PHASE 3: COUNCIL ── */}
            <PhaseGate
              n={3}
              unlocked={phase3Unlocked}
              done={false}
              icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 7l7-4 7 4M5 17l7 4 7-4" stroke="#9d91ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10l9 5 9-5" stroke="#9d91ff" strokeWidth="1" strokeLinecap="round" opacity="0.5"/></svg>}
              color="#9d91ff"
              title="The Council of Selves"
              sub="Every version of you gathers to debate — then asks the question you've been avoiding."
              lockedHint="Complete the Butterfly Effect to unlock"
              cta="Enter the Council Chamber →"
              onClick={() => transitionTo("council-of-selves")}
            />

            {/* ── PHASE 4: CHRONICLE — emerges only after first edition ── */}
            <AnimatePresence>
              {hasChronicle && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  {/* Emergence divider */}
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.05 }}
                    style={{
                      height: 1, margin: "8px 0 28px",
                      background: "linear-gradient(90deg, transparent, #e8c97e66, transparent)",
                      transformOrigin: "center",
                    }}
                  />

                  <ChroniclePhaseCard
                    editions={state.chronicleEditions ?? []}
                    latestTitle={latestEdition?.title ?? ""}
                    latestEditionNumber={latestEdition?.editionNumber ?? 1}
                    onClick={() => transitionTo("chronicle")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Activity chip with hover tooltip ── */
function ActivityChip({ activity, done, color }: {
  activity: { key: string; label: string; icon: string; desc: string };
  done: boolean; color: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span style={{
        fontSize: 11, width: 22, height: 22, borderRadius: 6, cursor: "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: done ? `${color}22` : "var(--surface)",
        border: `1px solid ${done ? color + "55" : "var(--border)"}`,
        opacity: done ? 1 : 0.4, filter: done ? "none" : "grayscale(1)",
      }}>{activity.icon}</span>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              zIndex: 30, width: 180, padding: "10px 12px", borderRadius: 10, textAlign: "left",
              background: "rgba(10,11,16,0.98)", border: `1px solid ${color}44`,
              boxShadow: `0 10px 30px -10px ${color}55`, pointerEvents: "none",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{activity.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: done ? color : "var(--text)" }}>{activity.label}</span>
              {done && <span style={{ marginLeft: "auto", fontSize: 10, color: color }}>✓</span>}
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{activity.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Phase tracker (vertical, collapsible) ── */
function PhaseTracker({ current, steps, collapsed, onToggle }: { current: number; steps: { n: number; label: string; sub: string; desc: string }[]; collapsed: boolean; onToggle: () => void }) {
  // Collapsed state is persisted in AppState, so hiding it sticks across navigation/reloads.
  const open = !collapsed;
  return (
    <div style={{ marginBottom: 48 }}>
      {/* Header row with collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: open ? 20 : 0,
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: "var(--text3)", fontFamily: "Sora, sans-serif",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Journey Progress
        </span>
        <span style={{ fontSize: 10, color: "var(--text3)", opacity: 0.6 }}>
          · Phase {current} of {steps.length}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          style={{ marginLeft: 2, transition: "transform 0.25s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="phase-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {steps.map((s, i) => {
              const done = current > s.n;
              const active = current === s.n;
              const locked = current < s.n;
              const color = done ? "#4ecdc4" : active ? "var(--violet2)" : "var(--text3)";
              const last = i === steps.length - 1;
              return (
                <div key={s.n} style={{ display: "flex", gap: 16 }}>
                  {/* Rail */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                      background: done ? "#4ecdc422" : active ? "var(--violet)" : "var(--surface)",
                      border: `1px solid ${done ? "#4ecdc4" : active ? "var(--violet2)" : "var(--border2)"}`,
                      color: done ? "#4ecdc4" : active ? "#fff" : "var(--text3)",
                      boxShadow: active ? "0 0 20px rgba(124,110,247,0.4)" : "none",
                    }}>
                      {done ? "✓" : locked
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        : s.n}
                    </div>
                    {!last && (
                      <div style={{ width: 2, flex: 1, minHeight: 28, marginTop: 4,
                        background: done ? "#4ecdc4" : "var(--border)" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingBottom: last ? 0 : 24, opacity: locked ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: active ? "var(--text)" : color, letterSpacing: "-0.2px" }}>{s.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "2px 8px", borderRadius: 100,
                        background: done ? "#4ecdc418" : active ? "rgba(124,110,247,0.15)" : "var(--surface)",
                        color: done ? "#4ecdc4" : active ? "var(--violet2)" : "var(--text3)",
                        border: `1px solid ${done ? "#4ecdc433" : active ? "rgba(124,110,247,0.3)" : "var(--border)"}` }}>
                        {s.sub}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.55, maxWidth: 560 }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Phase heading ── */
function PhaseHeading({ n, title, sub, done }: { n: number; title: string; sub: string; active?: boolean; done?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
        background: done ? "#4ecdc422" : "var(--violet)", border: `1px solid ${done ? "#4ecdc4" : "var(--violet2)"}`,
        color: done ? "#4ecdc4" : "#fff",
      }}>{done ? "✓" : n}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)" }}>Phase {n}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px" }}>{title}</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginLeft: 4, flex: 1 }}>{sub}</div>
    </div>
  );
}

/* ── Locked / unlocked phase gate panel ── */
/* ── Chronicle Phase 4 Card ── */
function ChroniclePhaseCard({ editions, latestTitle, latestEditionNumber, onClick }: {
  editions: any[]; latestTitle: string; latestEditionNumber: number; onClick: () => void;
}) {
  const GOLD = "#e8c97e";
  const toRoman = (n: number) => (["","I","II","III","IV","V","VI","VII","VIII","IX","X"][n] ?? String(n));
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        position: "relative", overflow: "hidden", marginBottom: 20,
        borderRadius: 20, cursor: "pointer",
        border: `1px solid ${hovered ? GOLD + "66" : GOLD + "28"}`,
        background: hovered
          ? `linear-gradient(135deg, ${GOLD}0e 0%, rgba(8,9,13,0.98) 60%)`
          : `linear-gradient(135deg, ${GOLD}08 0%, rgba(8,9,13,0.95) 70%)`,
        boxShadow: hovered ? `0 20px 60px -16px ${GOLD}44, 0 0 0 1px ${GOLD}18` : `0 8px 32px -8px ${GOLD}22`,
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
        padding: "28px 32px",
      }}
    >
      {/* Ambient glow top-left */}
      <div style={{ position: "absolute", top: -60, left: -40, width: 220, height: 180, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}18, transparent 65%)`, pointerEvents: "none" }} />

      {/* Top gold line */}
      <motion.div
        animate={{ opacity: hovered ? 0.9 : 0.4 }}
        style={{ position: "absolute", top: 0, left: 32, right: 32, height: 1,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
        {/* Book icon */}
        <motion.div
          animate={{ boxShadow: hovered ? `0 0 28px ${GOLD}55` : `0 0 12px ${GOLD}22` }}
          style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}10)`,
            border: `1px solid ${GOLD}44`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}
        ><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#e8c97e" strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#e8c97e" strokeWidth="1.3"/><path d="M8 7h8M8 11h6" stroke="#e8c97e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg></motion.div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: GOLD, fontFamily: "Sora, sans-serif" }}>Phase 4</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "2px 8px", borderRadius: 100,
              background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}33` }}>
              {editions.length} {editions.length === 1 ? "Edition" : "Editions"} Recorded
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 4 }}>
            The Chronicle
          </div>
          <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.55, margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 480 }}>
            {latestTitle
              ? `Latest: Edition ${toRoman(latestEditionNumber)} — "${latestTitle}"`
              : "The Historian has begun recording your saga across timelines."}
          </p>
        </div>

        {/* CTA */}
        <motion.button
          animate={{
            background: hovered ? GOLD : "transparent",
            color: hovered ? "#0e0c09" : GOLD,
          }}
          transition={{ duration: 0.2 }}
          style={{
            flexShrink: 0, padding: "10px 22px", borderRadius: 10,
            border: `1px solid ${GOLD}66`,
            fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.02em",
          }}
        >
          Open Archive →
        </motion.button>
      </div>
    </motion.div>
  );
}

function PhaseGate({ n, unlocked, done, icon, color, title, sub, lockedHint, cta, onClick }: {
  n: number; unlocked: boolean; done: boolean; icon: React.ReactNode; color: string;
  title: string; sub: string; lockedHint: string; cta: string; onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => unlocked && onClick()}
      style={{
        position: "relative", overflow: "hidden", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 20, padding: 28, borderRadius: 20,
        cursor: unlocked ? "pointer" : "default",
        background: unlocked ? `linear-gradient(135deg, ${color}12, var(--surface))` : "var(--bg2)",
        border: `1px solid ${unlocked ? color + "40" : "var(--border)"}`,
        opacity: unlocked ? 1 : 0.55, transition: "all 0.3s",
      }}
      onMouseEnter={e => { if (unlocked) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${color}77`; el.style.boxShadow = `0 14px 44px -16px ${color}66`; } }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${unlocked ? color + "40" : "var(--border)"}`; el.style.boxShadow = "none"; }}
    >
      {unlocked && <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}22, transparent 70%)`, pointerEvents: "none" }} />}

      <div style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0, position: "relative",
        background: unlocked ? `linear-gradient(135deg, ${color}40, ${color}15)` : "var(--surface)",
        border: `1px solid ${unlocked ? color + "44" : "var(--border2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
        filter: unlocked ? "none" : "grayscale(1)",
      }}>
        {unlocked ? icon : <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--text3)" strokeWidth="1.4"/><path d="M8 11V7a4 4 0 018 0v4" stroke="var(--text3)" strokeWidth="1.4" strokeLinecap="round"/></svg>}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: unlocked ? color : "var(--text3)" }}>Phase {n}</span>
          {done && <span style={{ fontSize: 10, fontWeight: 600, color: "#4ecdc4" }}>✓ Done</span>}
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.5 }}>
          {unlocked ? sub : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>{lockedHint}</span>}
        </p>
      </div>

      {unlocked && (
        <div style={{ flexShrink: 0, padding: "12px 22px", borderRadius: 12, background: color, color: "#0a0a0a",
          fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
          {cta}
        </div>
      )}
    </motion.div>
  );
}
