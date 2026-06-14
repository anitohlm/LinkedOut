"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getAllUniverses, getUniverse } from "@/lib/universes";
import { StabilityHUD } from "@/components/StabilityHUD";
import { DASH_GRID_CSS, Panel, PanelHead, PanelText, PanelCTA, StabilityRing, SectionLabel, DashboardHeader, DashboardFooter } from "@/components/screens/DiscoveryDashboard";
import UniverseIcon from "@/components/UniverseIcon";
import { applyEvent } from "@/lib/stability";
import { H, logEntry } from "@/lib/historian";
import { generatePortrait } from "@/lib/agents/useAgents";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}


// Universe-specific typography for the world name heading (spec item #8)
const WORLD_TITLE_STYLE: Record<string, React.CSSProperties> = {
  medieval:  { fontFamily: "'Cinzel', serif", letterSpacing: "0.14em" },
  cyberpunk: { fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" },
  pirate:    { fontFamily: "'Sora', sans-serif", fontStyle: "italic", letterSpacing: "0.02em" },
  dragon:    { fontFamily: "'Cinzel Decorative', serif", letterSpacing: "0.1em" },
  galactic:  { fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.08em" },
  vampire:   { fontFamily: "'Crimson Pro', serif", fontStyle: "italic", letterSpacing: "0.06em", fontSize: 12 },
};


// Downscale a (large) portrait data URI to a small JPEG so 6 portraits fit
// comfortably in the localStorage save without blowing the quota.
async function compressPortrait(dataUri: string, maxW = 480): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUri); return; }
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL("image/jpeg", 0.82)); }
      catch { resolve(dataUri); }
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

// Load an image (data URI or same-origin URL) for canvas compositing.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Greedy word-wrap for canvas text.
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

// Composite a shareable character card (portrait + name/world/era/job) and download it.
async function downloadCardImage(opts: {
  bg: string; accent: string; world: string; era: string; name: string; job: string; fileName: string;
}) {
  const { bg, accent, world, era, name, job, fileName } = opts;
  // 3× supersampled render for a crisp HD export.
  const S = 3;
  const W = 820 * S, H = 1093 * S, pad = 54 * S;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";

  try { await (document as any).fonts?.ready; } catch {}

  // Background image, cover-fit
  try {
    const img = await loadImage(bg);
    const scale = Math.max(W / img.width, H / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } catch {
    ctx.fillStyle = "#0a0b10"; ctx.fillRect(0, 0, W, H);
  }

  const maxW = W - pad * 2;
  ctx.textBaseline = "alphabetic";

  // Pre-measure wrapped name lines
  ctx.font = `800 ${46 * S}px Sora, sans-serif`;
  const nameLines = wrapText(ctx, name, maxW).slice(0, 2);

  const kickerH = era ? 28 + 24 : 30; // world line (+ era line if present)
  const blockH = (kickerH + 14 + nameLines.length * 54 + 10 + 34) * S;
  let y = H - pad - blockH + 26 * S;

  // Bottom scrim — tall enough to cover the whole text block for legibility
  const gradTop = Math.min(H * 0.34, y - 60 * S);
  const g = ctx.createLinearGradient(0, H, 0, gradTop);
  g.addColorStop(0, "rgba(6,7,11,0.97)");
  g.addColorStop(0.5, "rgba(6,7,11,0.82)");
  g.addColorStop(1, "rgba(6,7,11,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Kicker — world name (line 1), era (line 2)
  ctx.fillStyle = accent;
  ctx.font = `700 ${20 * S}px Sora, sans-serif`;
  try { (ctx as any).letterSpacing = `${3 * S}px`; } catch {}
  ctx.fillText(ellipsize(ctx, world.toUpperCase(), maxW), pad, y);
  if (era) {
    y += 24 * S;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `600 ${16 * S}px Sora, sans-serif`;
    try { (ctx as any).letterSpacing = `${2.5 * S}px`; } catch {}
    ctx.fillText(ellipsize(ctx, era.toUpperCase(), maxW), pad, y);
  }
  try { (ctx as any).letterSpacing = "0px"; } catch {}
  y += (28 + 14) * S;

  // Name
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${46 * S}px Sora, sans-serif`;
  for (const ln of nameLines) { ctx.fillText(ln, pad, y); y += 54 * S; }
  y += 10 * S;

  // Job / title
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `500 ${25 * S}px Sora, sans-serif`;
  ctx.fillText(ellipsize(ctx, job, maxW), pad, y);

  // Trigger download
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
}

const DISCOVERY_SWIPER_CSS = `
  .discovery-swiper { padding: 8px 8px 64px; }
  .discovery-swiper .discovery-slide { width: 360px; height: auto; }
  .discovery-swiper .swiper-pagination { bottom: 16px; }
  .discovery-swiper .swiper-pagination-bullet { background: var(--text3); opacity: 0.45; }
  .discovery-swiper .swiper-pagination-bullet-active { background: var(--violet2); opacity: 1; width: 22px; border-radius: 4px; }
  .discovery-swiper .swiper-button-next, .discovery-swiper .swiper-button-prev { color: var(--violet2); }
  .discovery-swiper .swiper-button-next::after, .discovery-swiper .swiper-button-prev::after { font-size: 24px; font-weight: 700; }
  @media (max-width: 480px) {
    .discovery-swiper .discovery-slide { width: 300px; }
    .discovery-swiper .swiper-button-next, .discovery-swiper .swiper-button-prev { display: none; }
  }
`;

export default function UniverseDiscovery({ state, transitionTo, updateState }: Props) {
  const rm = useReducedMotion() ?? false;
  const universes = getAllUniverses();
  const profileCount = Object.keys(state.allProfiles || {}).length;
  const allReady = profileCount === universes.length;

  const explored = state.explored || [];
  const exploredCount = explored.length;
  const phase1Done = exploredCount >= universes.length;
  const phase2Unlocked = true; // Butterfly Effect is always accessible
  const phase2Done = !!state.usedButterfly;
  const phase3Unlocked = phase2Done;

  const hasChronicle = (state.chronicleEditions?.length ?? 0) > 0;
  const phase3Done = !!state.selectedUniverse;
  const phase4Unlocked = phase3Done || hasChronicle;

  // ── Chronicle unlock notification ──────────────────────────────────────────
  const NOTIF_KEY = "linkedout_chronicle_unlocked_seen";
  const [showChronicleNotif, setShowChronicleNotif] = useState(false);
  const [hoveredUniverse, setHoveredUniverse] = useState<string | null>(null);
  const [portraitLoading, setPortraitLoading] = useState<string | null>(null);
  // Full-resolution portraits kept in-memory for HD downloads (cache holds only the compressed copy).
  const fullPortraits = useRef<Record<string, string>>({});

  // Generate (and cache) an alternate-self portrait for one universe, on demand.
  const makePortrait = async (universeId: UniverseType, e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger the card's explore() click
    const profile = state.allProfiles?.[universeId];
    if (!profile || portraitLoading) return;
    setPortraitLoading(universeId);
    try {
      const { image } = await generatePortrait(profile, universeId, state.resumeAnalysis || undefined);
      fullPortraits.current[universeId] = image;       // keep full-res for HD download
      const small = await compressPortrait(image);     // compressed copy for display + persistence
      updateState({ portraits: { ...(state.portraits || {}), [universeId]: small } });
    } catch (err) {
      console.error("Portrait failed:", err);
    } finally {
      setPortraitLoading(null);
    }
  };
  const [showStabilityBriefing, setShowStabilityBriefing] = useState(false);
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

  // ── Stability briefing: first entry only ──────────────────────────────────
  useEffect(() => {
    if (!state.hasSeenStabilityBriefing) {
      // Small delay so the page renders first before the modal appears
      const t = setTimeout(() => setShowStabilityBriefing(true), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissStabilityBriefing = () => {
    setShowStabilityBriefing(false);
    updateState({ hasSeenStabilityBriefing: true });
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>

      {/* ── Epic landscape background ─────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "url('/landing/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(6,7,16,0.86) 0%, rgba(6,7,16,0.9) 40%, rgba(6,7,16,0.95) 100%)" }} />

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

      {/* ── Stability Briefing Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showStabilityBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: rm ? 0.1 : 0.25 }}
            style={{
              position: "fixed", inset: 0, zIndex: 1100,
              background: "rgba(4,5,8,0.88)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
            onClick={dismissStabilityBriefing}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stability-briefing-title"
          >
            <motion.div
              initial={rm ? false : { opacity: 0, y: 28, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={rm ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: rm ? 0.1 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 480,
                background: "rgba(10,11,16,0.98)",
                border: "1px solid rgba(124,110,247,0.35)",
                borderRadius: 24, overflow: "hidden",
                boxShadow: "0 32px 80px -16px rgba(0,0,0,0.9), 0 0 0 1px rgba(124,110,247,0.12), inset 0 1px 0 rgba(124,110,247,0.15)",
              }}
            >
              {/* Violet top accent line */}
              <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #7c6ef7cc, transparent 95%)" }} />

              <div style={{ padding: "36px 36px 32px" }}>

                {/* Stability ring + score */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                  <div style={{ position: "relative", width: 96, height: 96 }}>
                    <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                      {/* Track */}
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(124,110,247,0.12)" strokeWidth="5" />
                      {/* Progress arc */}
                      <motion.circle
                        cx="48" cy="48" r="40"
                        fill="none"
                        stroke="#7c6ef7"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={rm ? { duration: 0 } : { duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ filter: "drop-shadow(0 0 6px #7c6ef7aa)" }}
                      />
                    </svg>
                    {/* Score text centred in ring */}
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#7c6ef7", fontFamily: "Sora, sans-serif", lineHeight: 1 }}>
                        100%
                      </span>
                      <span style={{ fontSize: 9, color: "rgba(124,110,247,0.7)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>
                        Stable
                      </span>
                    </div>
                    {/* Ambient glow */}
                    <div style={{
                      position: "absolute", inset: -12, borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(124,110,247,0.12) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }} />
                  </div>
                </div>

                {/* Eyebrow */}
                <p id="stability-briefing-title" style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "rgba(124,110,247,0.7)", marginBottom: 10, fontFamily: "Sora, sans-serif", textAlign: "center",
                }}>
                  Timeline Status
                </p>

                {/* Headline */}
                <h2 style={{
                  fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)",
                  marginBottom: 14, lineHeight: 1.2, fontFamily: "Sora, sans-serif", textAlign: "center",
                }}>
                  Your Timeline is Stable
                </h2>

                {/* Body */}
                <p style={{
                  fontSize: 15, color: "var(--text2)", lineHeight: 1.72, marginBottom: 28,
                  fontFamily: "Sora, sans-serif", textAlign: "center",
                }}>
                  Your timeline integrity is at <strong style={{ color: "var(--text)", fontWeight: 700 }}>100%</strong> — fully synchronized across all realities.
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

                {/* Mechanic explanation */}
                <div style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(124,110,247,0.07)", border: "1px solid rgba(124,110,247,0.15)",
                  marginBottom: 28,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" stroke="#7c6ef7" strokeWidth="1.5"/>
                    <path d="M12 8v4m0 4h.01" stroke="#7c6ef7" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65, margin: 0, fontFamily: "Sora, sans-serif" }}>
                    As you explore universes, make decisions, and engage with your alternate selves — actions will <strong style={{ color: "var(--text)" }}>raise or lower</strong> this stability. Watch it carefully.
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={dismissStabilityBriefing}
                  autoFocus
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 12, cursor: "pointer",
                    background: "linear-gradient(135deg, #7c6ef7, #5b4fd4)",
                    border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
                    fontFamily: "Sora, sans-serif", letterSpacing: "0.02em",
                    boxShadow: "0 8px 24px -8px rgba(124,110,247,0.55)",
                    touchAction: "manipulation", minHeight: 48,
                    transition: rm ? "none" : "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Begin Exploration →
                </button>

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
            if (!confirm("Start over with a new career profile? This clears your current multiverse.")) return;
            try { localStorage.removeItem("linkedout_save_v1"); } catch {}
            fullPortraits.current = {};
            transitionTo("upload-resume", {
              resumeText: null, resumeAnalysis: null, selectedUniverse: null,
              allProfiles: {} as any, allFutureSelves: {} as any, conversations: {} as any,
              portraits: {},
              timelineState: { stability: 100, status: "stable" }, explored: [], usedButterfly: false,
            });
          }}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500,
            cursor: "pointer", background: "none", border: "none", color: "var(--text2)", fontFamily: "Sora, sans-serif" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
        >
          ↻ New Career Profile
        </button>
        <button onClick={() => transitionTo("landing")} style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px",
          background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          <img src="/landing/logo.png" alt="LinkedOut" style={{ height: 26, width: "auto", display: "block" }} />
        </button>
        {/* Stability HUD only once the multiverse is actually built */}
        {allReady
          ? <StabilityHUD stability={state.timelineState.stability} log={state.historianLog} stabilityLog={state.stabilityLog} />
          : <span style={{ width: 50 }} />}
      </nav>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } } }}
          style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 52px" }}
        >
          {/* Ornamental flourish */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 26 }}>
            <span style={{ width: 56, height: 1, background: "linear-gradient(90deg, transparent, #e8c97e)" }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" fill="#e8c97e" opacity="0.9" />
            </svg>
            <span style={{ width: 56, height: 1, background: "linear-gradient(90deg, #e8c97e, transparent)" }} />
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
            style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(30px, 5.2vw, 52px)", fontWeight: 600,
              letterSpacing: "0.07em", lineHeight: 1.22, margin: "0 0 22px", color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.6), 0 0 40px rgba(232,201,126,0.12)" }}>
            You Are Not<br />Just One Story
          </motion.h1>

          {/* Body */}
          <motion.p variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            style={{ fontFamily: "'Crimson Pro', serif", fontSize: "clamp(16px, 2.2vw, 20px)", lineHeight: 1.85,
              color: "rgba(255,255,255,0.72)", margin: "0 auto", maxWidth: 580, fontWeight: 300 }}>
            Across six universes, your talents took different paths.<br />
            Meet the selves that emerged from those choices.
          </motion.p>
        </motion.div>

        {!allReady && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
            Loading universes...
          </div>
        )}

        {/* ── PHASE 1: EXPLORE ── */}
        {allReady && (
          <>
            <SectionLabel
              title="Your Universes"
              sub={phase1Done ? "Every reality witnessed. Your timeline is ready to fracture." : `Open all six to understand who you could become. ${exploredCount} of 6 explored.`}
            />

            <div style={{ marginBottom: 56, position: "relative" }}>
              <style>{DISCOVERY_SWIPER_CSS}</style>
              <Swiper
                modules={[EffectCoverflow, Navigation, Pagination]}
                effect="coverflow"
                grabCursor
                centeredSlides
                loop
                slidesPerView="auto"
                coverflowEffect={{ rotate: 0, stretch: 0, depth: 120, modifier: 2.2, slideShadows: false }}
                navigation
                pagination={{ clickable: true }}
                className="discovery-swiper"
              >
              {universes.map((universe) => {
                const profile = state.allProfiles?.[universe.id];
                const c = universe.color;
                const visited = explored.includes(universe.id);
                const portrait = state.portraits?.[universe.id];
                const acceptedPos = (state.acceptedPositions || []).find(p => p.universeId === universe.id);
                const rawTitle = acceptedPos?.title ?? profile?.profession ?? "";
                // Strip " — description" suffixes the AI sometimes appends to role titles
                const cardTitle = rawTitle.split(/\s[—–-]\s/)[0].trim();

                // ── Image-forward card design (all universes) ──
                {
                  const bg = portrait || `/universe-art/${universe.id}.png`;
                  return (
                    <SwiperSlide key={universe.id} className="discovery-slide">
                    <motion.div
                      onClick={() => explore(universe.id)}
                      style={{
                        position: "relative", borderRadius: 22, overflow: "hidden", cursor: "pointer",
                        height: 560, width: "100%", border: `1px solid ${visited ? c + "55" : "var(--border)"}`,
                        backgroundColor: "var(--bg2)",
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${c}88`; el.style.boxShadow = `0 24px 70px -18px ${c}66`; setHoveredUniverse(universe.id); }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = visited ? `${c}55` : "var(--border)"; el.style.boxShadow = "none"; setHoveredUniverse(null); }}
                    >
                      {/* Full-bleed image */}
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",
                        transition: "transform 0.5s ease",
                        transform: hoveredUniverse === universe.id ? "scale(1.06)" : "scale(1)",
                      }} />
                      {/* Bottom gradient for text legibility */}
                      <div style={{ position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(6,7,11,0.94) 0%, rgba(6,7,11,0.72) 26%, rgba(6,7,11,0.18) 52%, transparent 72%)" }} />

                      {/* Download card as image */}
                      {profile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCardImage({
                              bg: fullPortraits.current[universe.id] || bg, accent: c,
                              world: profile.worldName || universe.title,
                              era: profile.eraName || "",
                              name: profile.alternativeName || universe.title,
                              job: cardTitle,
                              fileName: `linkedout-${universe.id}-${(profile.alternativeName || "card").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`,
                            });
                          }}
                          title="Download character card"
                          aria-label="Download character card"
                          style={{
                            position: "absolute", top: 12, right: 12, zIndex: 3,
                            width: 32, height: 32, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            background: "rgba(8,9,13,0.55)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.22)", color: "#fff",
                            touchAction: "manipulation",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(8,9,13,0.85)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(8,9,13,0.55)"; }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v12M12 15l-4-4M12 15l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}

                      {/* Generate / regenerate portrait */}
                      {profile && (
                        <button
                          onClick={(e) => makePortrait(universe.id, e)}
                          disabled={!!portraitLoading}
                          title={portrait ? "Regenerate portrait" : "Generate portrait"}
                          style={{
                            position: "absolute", top: 12, left: 12, zIndex: 3,
                            display: "flex", alignItems: "center", gap: 6, minHeight: 32,
                            padding: "6px 11px", borderRadius: 100, cursor: portraitLoading ? "wait" : "pointer",
                            background: "rgba(8,9,13,0.72)", backdropFilter: "blur(8px)",
                            border: `1px solid ${c}55`, color: "#fff",
                            fontFamily: "Sora, sans-serif", fontSize: 11, fontWeight: 600,
                            opacity: portraitLoading && portraitLoading !== universe.id ? 0.4 : 1,
                            touchAction: "manipulation",
                          }}
                        >
                          {portraitLoading === universe.id ? (
                            <>
                              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ width: 11, height: 11, borderRadius: "50%", border: `1.5px solid ${c}`, borderTopColor: "transparent", display: "inline-block" }} />
                              Summoning…
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              {portrait ? "Redo" : "Portrait"}
                            </>
                          )}
                        </button>
                      )}

                      {/* Overlaid text block */}
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 22px 22px", zIndex: 2 }}>
                        {profile ? (
                          <>
                            {/* Kicker: world name (line 1) + era (line 2) */}
                            <div style={{ marginBottom: 8 }}>
                              <div style={{
                                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                                color: c, display: "flex", alignItems: "center", gap: 6, lineHeight: 1.3,
                                ...(WORLD_TITLE_STYLE[universe.id] ?? {}),
                              }}>
                                {visited && (
                                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                                {profile.worldName}
                              </div>
                              {profile.eraName && (
                                <div style={{
                                  fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                                  color: "rgba(255,255,255,0.5)", lineHeight: 1.3, marginTop: 2,
                                }}>
                                  {profile.eraName}
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1.15, margin: "0 0 4px", color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
                              {profile.alternativeName}
                            </h3>

                            {/* Title */}
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", fontWeight: 500, margin: "0 0 10px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }} title={cardTitle}>
                              {cardTitle}
                            </p>

                            {/* Description / bio preview */}
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.66)", lineHeight: 1.55, margin: "0 0 16px",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                              textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}>
                              {(profile.biography || "").replace(/\\n/g, " ").slice(0, 130)}…
                            </p>

                            {/* Divider + CTA */}
                            <div style={{ height: 1, background: "rgba(255,255,255,0.18)", marginBottom: 14 }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "Sora, sans-serif", letterSpacing: "0.01em" }}>
                                {visited ? "Revisit" : "Explore Now"}
                              </span>
                              <span style={{
                                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: `${c}22`, border: `1px solid ${c}66`,
                              }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </div>
                          </>
                        ) : (
                          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Loading profile…</div>
                        )}
                      </div>
                    </motion.div>
                    </SwiperSlide>
                  );
                }
              })}
              </Swiper>
            </div>

            {/* ── YOUR MULTIVERSE — dashboard ── */}
            <div style={{ marginTop: 12 }}>
              <style>{DASH_GRID_CSS}</style>
              <DashboardHeader />

              <div className="lo-dash-grid">

                {/* Timeline Stability */}
                <Panel accent="#4ecdc4" image="/dashboard/timeline-stability.png">
                  <PanelHead accent="#4ecdc4" kicker="Equilibrium" title="Timeline Stability" bareIcon
                    icon={<img src="/universe-icons/timeline-stability.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <StabilityRing value={Math.round(state.timelineState?.stability ?? 100)} />
                    <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55, margin: 0, flex: 1 }}>
                      Every conversation with a future self shifts the balance. Keep your timeline whole.
                    </p>
                  </div>
                </Panel>

                {/* The Butterfly Effect (in place of the Career DNA panel) */}
                <Panel accent="#9d91ff" image="/dashboard/butterfly.png" locked={!phase2Unlocked} lockHint="Explore all six universes to unlock">
                  <PanelHead accent="#9d91ff" kicker="What If" title="The Butterfly Effect" bareIcon
                    icon={<img src="/universe-icons/butterfly-effect.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  <PanelText>Change one decision and watch your life fracture across four divergent timelines.</PanelText>
                  <PanelCTA accent="#9d91ff" label={phase2Done ? "Revisit" : "Begin"} onClick={() => transitionTo("butterfly-effect")} disabled={!phase2Unlocked} />
                </Panel>

                {/* Council of Selves */}
                <Panel accent="#6c8cff" image="/dashboard/council.png" locked={!phase3Unlocked} lockHint="Complete the Butterfly Effect to unlock">
                  <PanelHead accent="#6c8cff" kicker="Convergence" title="Council of Selves" bareIcon
                    icon={<img src="/universe-icons/council.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  <PanelText>Gather every version of you to debate — then choose who you&apos;re willing to become.</PanelText>
                  <PanelCTA accent="#6c8cff" label="Enter Council" onClick={() => transitionTo("council-of-selves")} disabled={!phase3Unlocked} />
                </Panel>

                {/* Latest Transmissions */}
                <Panel accent="#4ecdc4" image="/dashboard/transmissions.png">
                  <PanelHead accent="#4ecdc4" kicker="Signals" title="Latest Transmissions" bareIcon
                    icon={<img src="/universe-icons/latest-transmission.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  {(() => {
                    const tx = Object.entries(state.transmissions || {})
                      .map(([uid, t]: [string, any]) => ({ uid, count: (t?.messages || []).filter((m: any) => m.role === "assistant").length }))
                      .filter(x => x.count > 0).slice(0, 3);
                    if (!tx.length) return <PanelText>No transmissions yet. Open a universe and talk to your future self.</PanelText>;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {tx.map(t => { const u = getUniverse(t.uid as UniverseType); return (
                          <div key={t.uid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <UniverseIcon id={t.uid} size={20} color={u.color} />
                            <span style={{ flex: 1, fontSize: 12, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: u.color }}>{t.count} msg{t.count !== 1 ? "s" : ""}</span>
                          </div>
                        ); })}
                      </div>
                    );
                  })()}
                  <PanelCTA accent="#4ecdc4" label="View All" onClick={() => transitionTo("latest-transmissions")} />
                </Panel>

                {/* Multiverse Offers — generated recruiter offers per universe */}
                <Panel accent="#e8c97e" image="/dashboard/offers.png">
                  <PanelHead accent="#e8c97e" kicker="Recruitment" title="Multiverse Offers" bareIcon
                    icon={<img src="/universe-icons/multiverse-offers.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  {(() => {
                    const offers = (Object.entries(state.cachedInvitations || {}) as [string, any][]).slice(0, 3);
                    if (!offers.length) return <PanelText>No offers yet. Explore universes and recruiters will come calling.</PanelText>;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {offers.map(([uid, inv]) => { const u = getUniverse(uid as UniverseType); return (
                          <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <UniverseIcon id={uid} size={20} color={u.color} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv?.opportunityTitle || "Position offered"}</div>
                              <div style={{ fontSize: 10.5, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv?.factionName || u.title}</div>
                            </div>
                          </div>
                        ); })}
                      </div>
                    );
                  })()}
                  <PanelCTA accent="#e8c97e" label="View All Offers" onClick={() => transitionTo("multiverse-offers")} />
                </Panel>

                {/* The Chronicle */}
                <Panel accent="#e8c97e" image="/dashboard/chronicle.png" imageFull locked={!phase4Unlocked} lockHint="Choose a universe to begin your chronicle">
                  <PanelHead accent="#e8c97e" kicker="Your Saga" title="The Chronicle" bareIcon
                    icon={<img src="/universe-icons/chronicle.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  <PanelText>{hasChronicle ? `${state.chronicleEditions!.length} edition${state.chronicleEditions!.length !== 1 ? "s" : ""} recorded across your timelines.` : "Your story across every reality, written as you live it."}</PanelText>
                  <PanelCTA accent="#e8c97e" label="Open Chronicle" onClick={() => transitionTo("chronicle")} disabled={!phase4Unlocked} />
                </Panel>

                {/* The Historian */}
                <Panel accent="#6c8cff" image="/dashboard/historian.png" imageFull wide locked={!phase4Unlocked} lockHint="Unlocks alongside your chronicle">
                  <PanelHead accent="#6c8cff" kicker="Keeper of Record" title="The Historian" bareIcon
                    icon={<img src="/universe-icons/historian.png" alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />} />
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                    &ldquo;I record what you become. In time, it becomes legend.&rdquo;
                  </p>
                  <PanelCTA accent="#6c8cff" label="Consult" onClick={() => transitionTo("historian-log")} disabled={!phase4Unlocked} />
                </Panel>

              </div>

              <DashboardFooter />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
