"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { generateButterflyEffect } from "@/lib/agents/useAgents";
import { applyEvent } from "@/lib/stability";
import { H, logEntry } from "@/lib/historian";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

// Per-type accent colors
const TYPE_COLOR: Record<string, string> = {
  realistic:  "#7c6ef7",
  optimistic: "#4ecdc4",
  quiet:      "#e8c97e",
  wildcard:   "#f07070",
};
const TYPE_LABEL: Record<string, string> = {
  realistic:  "Realistic",
  optimistic: "Optimistic",
  quiet:      "Quiet Path",
  wildcard:   "Wildcard ✦",
};

// Score band colors and labels
function scoreMeta(score: number): { color: string; label: string } {
  if (score >= 81) return { color: "#f07070", label: "Reality-altering" };
  if (score >= 51) return { color: "#e8a87e", label: "Major divergence" };
  if (score >= 21) return { color: "#e8c97e", label: "Moderate divergence" };
  return { color: "#7c6ef7", label: "Minor divergence" };
}

const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

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

/* ── Timeline card ──────────────────────────────────────────────────────────── */
function TimelineCard({ tl, idx, rm }: { tl: any; idx: number; rm: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const type = tl.type || ["realistic", "optimistic", "quiet", "wildcard"][idx] || "realistic";
  const color = TYPE_COLOR[type] ?? "#7c6ef7";
  const score = typeof tl.butterflyImpactScore === "number" ? tl.butterflyImpactScore : 40;
  const sm = scoreMeta(score);
  const gains: string[] = tl.gains || [];
  const losses: string[] = tl.losses || [];
  const ripples: string[] = tl.rippleEffects || [];
  const evolution: { age: number; role: string }[] = tl.personalEvolution || [];
  const milestones: string[] = tl.milestones || [];

  return (
    <motion.div
      initial={rm ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rm ? 0 : idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--surface)",
        border: `1px solid ${color}30`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, transparent 5%, ${color}cc, transparent 95%)`,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 200, height: 200,
        background: `radial-gradient(circle at 80% 10%, ${color}12, transparent 65%)`,
        pointerEvents: "none",
      }} />

      <div style={{ padding: "22px 24px 24px", position: "relative" }}>

        {/* Header row: type badge + letter + score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "3px 10px", borderRadius: 100,
              background: `${color}18`, color, border: `1px solid ${color}35`,
            }}>
              {TYPE_LABEL[type] ?? `Timeline ${tl.letter || String.fromCharCode(65 + idx)}`}
            </span>
          </div>
          {/* Impact score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            <span style={{ fontSize: 11, color: sm.color, fontWeight: 700 }}>{score}</span>
            <div style={{ width: 64, height: 3, background: "var(--surface3)", borderRadius: 3 }}>
              <div style={{ width: `${score}%`, height: "100%", background: sm.color, borderRadius: 3, transition: "width 0.8s ease" }} />
            </div>
            <span style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{sm.label}</span>
          </div>
        </div>

        {/* Codename */}
        <h3 style={{
          fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", lineHeight: 1.2,
          marginBottom: 6, color: "var(--text)",
        }}>
          {tl.codename || tl.title || `Timeline ${String.fromCharCode(65 + idx)}`}
        </h3>

        {/* Short title / identity */}
        {tl.title && tl.codename && (
          <p style={{ fontSize: 13, color, fontWeight: 500, marginBottom: 12 }}>{tl.title}</p>
        )}

        {/* World description */}
        {tl.worldDescription && (
          <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65, marginBottom: 16 }}>
            {clean(tl.worldDescription)}
          </p>
        )}

        {/* Summary fallback if no worldDescription */}
        {!tl.worldDescription && tl.summary && (
          <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65, marginBottom: 16 }}>
            {clean(tl.summary)}
          </p>
        )}

        {/* Gains / Losses */}
        {(gains.length > 0 || losses.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {gains.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ecdc4", marginBottom: 6 }}>
                  Gained
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {gains.slice(0, 4).map((g: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: "#4ecdc4", fontSize: 10, marginTop: 3, flexShrink: 0 }}>▲</span>
                      <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.4 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {losses.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f07070", marginBottom: 6 }}>
                  Lost
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {losses.slice(0, 4).map((l: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: "#f07070", fontSize: 10, marginTop: 3, flexShrink: 0 }}>▼</span>
                      <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.4 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse timeline details" : "Expand full timeline details"}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color, fontFamily: "Sora, sans-serif", fontWeight: 600,
            padding: "10px 0", minHeight: 44, marginBottom: expanded ? 10 : 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transition: rm ? "none" : "transform 0.25s", transform: expanded ? "rotate(180deg)" : "none" }}>
            <path d="M2 4l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {expanded ? "Collapse" : "Full timeline →"}
        </button>

        {/* ── EXPANDED SECTION ────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={rm ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={rm ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: rm ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              {/* Divider */}
              <div style={{ height: 1, background: `${color}20`, marginBottom: 20 }} />

              {/* Personal evolution */}
              {evolution.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
                    Who You Became
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {evolution.map((ev: { age: number; role: string }, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 14 }}>
                        {/* Timeline line */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />
                          {i < evolution.length - 1 && (
                            <div style={{ width: 1, flex: 1, background: `${color}30`, minHeight: 20, marginTop: 2, marginBottom: 2 }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: i < evolution.length - 1 ? 14 : 0 }}>
                          <span style={{ fontSize: 10, color, fontWeight: 700 }}>Age {ev.age}</span>
                          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, margin: "3px 0 0" }}>{ev.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones (if personalEvolution not available, fall back) */}
              {evolution.length === 0 && milestones.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
                    Milestones
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {milestones.map((m: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, marginTop: 6, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ripple effects */}
              {ripples.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
                    Ripple Effects
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ripples.map((r: string, i: number) => (
                      <div key={i} style={{
                        padding: "8px 12px", borderRadius: 8,
                        background: `${color}0d`, border: `1px solid ${color}20`,
                        fontSize: 12.5, color: "var(--text2)", lineHeight: 1.55,
                      }}>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legendary + Shadow outcomes */}
              {(tl.legendaryOutcome || tl.shadowOutcome) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {tl.legendaryOutcome && (
                    <div style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: "rgba(232,201,126,0.08)", border: "1px solid rgba(232,201,126,0.25)",
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8c97e", marginBottom: 5 }}>
                        Legendary
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55, margin: 0 }}>{tl.legendaryOutcome}</p>
                    </div>
                  )}
                  {tl.shadowOutcome && (
                    <div style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: "rgba(240,112,112,0.08)", border: "1px solid rgba(240,112,112,0.22)",
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f07070", marginBottom: 5 }}>
                        Shadow
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55, margin: 0 }}>{tl.shadowOutcome}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main screen ──────────────────────────────────────────────────────────── */
export default function ButterflyEffect({ state, transitionTo, updateState }: Props) {
  const rm = useReducedMotion() ?? false;
  const cached = state.butterflyCache;
  const [decision, setDecision] = useState(cached?.decision ?? "");
  const [timelines, setTimelines] = useState<any[]>(cached?.timelines ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.usedButterfly) updateState({ usedButterfly: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const prevStab = state.timelineState.stability;
      const { stability, status, event } = applyEvent(prevStab, "timeline-drift");
      const loss = prevStab - stability;
      logEntry(H.butterflyAsked(decision.trim(), loss), state, updateState, {
        toast: true,
        extra: {
          timelineState: { stability, status },
          stabilityMessage: event.message,
          butterflyCache: { decision: decision.trim(), timelines: newTimelines },
        },
      });
    } catch (e: any) {
      setError(e.message || "The timelines refused to fracture. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>
          ← Back
        </button>
        <button onClick={() => transitionTo("landing")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          <img src="/landing/logo.png" alt="LinkedOut" style={{ height: 26, width: "auto", display: "block" }} />
        </button>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 40px" }}>

        {/* Header */}
        <motion.div initial={rm ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
            Butterfly Effect Engine
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
            What If?
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.6 }}>
            Change one decision. Watch your life fracture across four divergent realities.
          </p>
        </motion.div>

        {/* Input */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
          <input
            value={decision}
            onChange={e => setDecision(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") generate(); }}
            placeholder="What if I never studied my field?"
            aria-label="Enter a life decision to explore alternate timelines"
            aria-busy={loading}
            disabled={loading}
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
              cursor: decision.trim() && !loading ? "pointer" : "not-allowed",
              opacity: loading ? 0.5 : 1,
              whiteSpace: "nowrap", touchAction: "manipulation",
            }}>
            {loading ? "Fracturing..." : "Generate →"}
          </button>
        </div>

        {/* Suggestion chips — always available so a NEW what-if can be run even after results exist */}
        {!loading && (
          <div style={{ marginTop: -24, marginBottom: 40 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {timelines.length ? "Explore another what-if:" : "Try one of these:"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {whatIfSuggestions(state).map(s => (
                <button key={s} onClick={() => setDecision(s)}
                  style={{
                    padding: "10px 14px", minHeight: 44, borderRadius: 100, cursor: "pointer",
                    background: "rgba(124,110,247,0.1)", border: "1px solid rgba(124,110,247,0.3)",
                    color: "var(--text2)", fontFamily: "Sora, sans-serif", fontSize: 13,
                    transition: rm ? "none" : "all 0.2s", touchAction: "manipulation",
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(124,110,247,0.2)"; b.style.color = "var(--text)"; b.style.borderColor = "var(--violet)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(124,110,247,0.1)"; b.style.color = "var(--text2)"; b.style.borderColor = "rgba(124,110,247,0.3)"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div role="alert" style={{ textAlign: "center", color: "var(--rose2)", padding: "20px 0" }}>{error}</div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <motion.div animate={rm ? {} : { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C10 8 4 6 2 9s2 7 6 6c-2 2-2 5 4 3" stroke="#7c6ef7" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M12 12C14 8 20 6 22 9s-2 7-6 6c2 2 2 5-4 3" stroke="#4ecdc4" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="12" cy="14" r="1.2" fill="#e8c97e"/>
                </svg>
              </motion.div>
            </div>
            <p style={{ fontSize: 14, marginBottom: 4 }}>Splitting your timeline four ways...</p>
            <p style={{ fontSize: 12, color: "var(--text3)", opacity: 0.7 }}>Each reality is being fully rendered</p>
          </div>
        )}

        {/* Score legend (when timelines present) */}
        {timelines.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}
          >
            <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Divergence:</span>
            {[
              { color: "#7c6ef7", label: "1-20 Minor" },
              { color: "#e8c97e", label: "21-50 Moderate" },
              { color: "#e8a87e", label: "51-80 Major" },
              { color: "#f07070", label: "81-100 Reality-altering" },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text3)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
                {label}
              </span>
            ))}
          </motion.div>
        )}

        {/* Timeline grid — align-items:start so expanding one card never stretches/collapses its row neighbor */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <AnimatePresence>
            {timelines.map((tl, i) => (
              <TimelineCard key={i} tl={tl} idx={i} rm={rm} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
