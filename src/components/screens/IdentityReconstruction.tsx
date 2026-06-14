"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UniverseArrivalModal from "@/components/UniverseArrivalModal";
import { AppState, AppScreenState } from "@/types";
import { getUniverse } from "@/lib/universes";
import UniverseBackground from "@/components/UniverseBackground";
import UniverseArtworkBackground from "@/components/UniverseArtworkBackground";
import UniverseIcon from "@/components/UniverseIcon";
import { markActivity } from "@/lib/progress";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

export default function IdentityReconstruction({ state, transitionTo, updateState }: Props) {
  const profile = state.selectedUniverse ? state.allProfiles?.[state.selectedUniverse] ?? null : null;
  const universe = state.selectedUniverse ? getUniverse(state.selectedUniverse) : null;

  // Arrival modal — shown on first entry per universe
  const arrivedUniverses = state.arrivedUniverses ?? [];
  // Initialize to true immediately if this is a first visit — modal blocks the profile from frame one
  const isFirstVisit = state.selectedUniverse ? !arrivedUniverses.includes(state.selectedUniverse) : false;
  const [showArrival, setShowArrival] = useState(isFirstVisit);

  useEffect(() => {
    if (!state.selectedUniverse || !profile) { transitionTo("universe-discovery"); return; }
    markActivity(state, updateState, state.selectedUniverse, "profile");
  }, []);

  const dismissArrival = () => {
    setShowArrival(false);
    if (state.selectedUniverse) {
      updateState({ arrivedUniverses: [...new Set([...arrivedUniverses, state.selectedUniverse])] });
    }
  };

  const replayArrival = () => {
    if (!state.selectedUniverse) return;
    updateState({ arrivedUniverses: arrivedUniverses.filter(id => id !== state.selectedUniverse) });
    setShowArrival(true);
  };

  if (!profile || !universe) return null;

  const accentColor = universe.color;
  const accentRgb = (() => {
    const h = accentColor.replace("#", "");
    const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return [r, g, b].some(isNaN) ? "124,110,247" : `${r},${g},${b}`;
  })();
  const acceptedPosition = (state.acceptedPositions || []).find(p => p.universeId === state.selectedUniverse);
  const rawDisplayTitle = acceptedPosition?.title ?? profile.profession ?? "";
  const displayTitle = rawDisplayTitle.split(/\s[—–-]\s/)[0].trim();

  // AI-generated character portrait (compressed JPEG data URI) + themed wax seal emblem
  const portrait = state.selectedUniverse ? state.portraits?.[state.selectedUniverse] : undefined;
  const sealSrc = universe.id === "medieval" ? "/universe-icons/eldergrove-seal.png" : `/universe-icons/${universe.id}.png`;

  // Eldergrove's scenic artwork is bright and bleeds through translucent panels, washing out
  // body text. Use near-opaque surfaces + brighter labels for this universe only.
  const solidPanels = universe.id === "medieval";
  const labelColor = solidPanels ? "var(--text2)" : "var(--text3)";

  // Universe-themed label for the recruiter mailbox
  const INVITATION_LABELS: Record<string, string> = {
    medieval: "Royal Summons",
    cyberpunk: "Corp Offers",
    pirate: "Crew Calls",
    dragon: "Ancient Covenants",
    galactic: "Commissions",
    vampire: "Blood Pacts",
  };
  const invitationLabel = INVITATION_LABELS[universe.id] || "Invitations";

  // Normalize escaped newlines the model sometimes returns as literal "\n"
  const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

  // Reusable section header with accent bar + label
  const SectionHeader = ({ label }: { label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ width: 3, height: 14, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: labelColor }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );

  const cardStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: solidPanels
      ? `linear-gradient(150deg, ${accentColor}16, rgba(12,13,18,0.94))`
      : `linear-gradient(150deg, ${accentColor}10, rgba(16,18,26,0.5))`,
    border: `1px solid ${accentColor}${solidPanels ? "33" : "26"}`,
    borderRadius: 16,
    padding: 28,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
    boxShadow: solidPanels ? "0 16px 40px -18px rgba(0,0,0,0.92)" : "0 10px 30px -18px rgba(0,0,0,0.8)",
    ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>

      {/* ── Universe Arrival Modal ─────────────────────────────────────────── */}
      {showArrival && profile && universe && (
        <UniverseArrivalModal
          universeId={universe.id}
          profile={profile}
          onDismiss={dismissArrival}
        />
      )}

      {/* Ambient themed background, merged with the universe's own scenic skyline at the bottom */}
      <UniverseBackground universeId={universe.id} color={accentColor} />
      <UniverseArtworkBackground universeId={universe.id} color={accentColor} />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}
        >
          ← Back
        </button>
        {/* Immersive world title — compact, fits the bar */}
        <button onClick={() => transitionTo("landing")} title="Return to LinkedOut"
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", textAlign: "center", lineHeight: 1.2, padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <UniverseIcon id={universe.id} size={15} color={accentColor} strokeWidth={1.6} />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)" }}>
              {profile.worldName}
            </span>
          </div>
          <div style={{ fontSize: 10, color: accentColor, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
            {profile.eraName}
          </div>
        </button>
        <div style={{ width: 60 }} />
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40, paddingBottom: 36, borderBottom: "1px solid var(--border)" }}
        >
          {/* Top row: large portrait + identity */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 36 }}>

            {/* Portrait — ornate gilded frame with themed seal medallion */}
            <div style={{ position: "relative", flexShrink: 0, width: 280 }}>
              {/* Ambient glow */}
              <div style={{
                position: "absolute", inset: -22, borderRadius: 32,
                background: `radial-gradient(circle at 50% 30%, ${accentColor}40, transparent 68%)`,
                filter: "blur(16px)", pointerEvents: "none",
              }} />

              {/* Gilded frame */}
              <div style={{
                position: "relative", borderRadius: 20, padding: 8,
                background: `linear-gradient(150deg, ${accentColor} 0%, ${accentColor}55 38%, #241c12 52%, ${accentColor}cc 100%)`,
                boxShadow: `0 28px 70px -18px rgba(0,0,0,0.95), 0 0 0 1px ${accentColor}66, inset 0 1px 0 ${accentColor}`,
              }}>
                {/* Recessed bevel holding the portrait */}
                <div style={{
                  borderRadius: 13, overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.55)",
                  boxShadow: "inset 0 2px 12px rgba(0,0,0,0.7)",
                }}>
                  {portrait ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={portrait} alt={`Portrait of ${profile.alternativeName}`}
                      style={{ display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "100%", aspectRatio: "3 / 4", display: "flex", alignItems: "center", justifyContent: "center",
                      background: `linear-gradient(160deg, ${accentColor}1f, var(--surface))`,
                    }}>
                      <UniverseIcon id={universe.id} size={96} color={accentColor} strokeWidth={1.4} />
                    </div>
                  )}
                </div>

                {/* Corner flourishes */}
                {[
                  { pos: { top: 5, left: 5 }, rot: 0 },
                  { pos: { top: 5, right: 5 }, rot: 90 },
                  { pos: { bottom: 5, right: 5 }, rot: 180 },
                  { pos: { bottom: 5, left: 5 }, rot: 270 },
                ].map((c, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 16 16" fill="none"
                    style={{ position: "absolute", ...c.pos, transform: `rotate(${c.rot}deg)`, pointerEvents: "none", opacity: 0.85 }}>
                    <path d="M2 7V2h5" stroke="#fff6d8" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ))}
              </div>

              {/* Seal medallion overlapping the frame's base */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: -28, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 66, height: 66, borderRadius: "50%",
                  background: "radial-gradient(circle at 42% 36%, #1b1408, #0a0805)",
                  border: `2px solid ${accentColor}`,
                  boxShadow: `0 8px 22px rgba(0,0,0,0.75), 0 0 20px ${accentColor}55, inset 0 1px 2px ${accentColor}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sealSrc} alt="" width={46} height={46} style={{ width: 46, height: 46, objectFit: "contain" }} />
                </div>
              </div>
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-1.4px", marginBottom: 8, color: "var(--text)", lineHeight: 1.04 }}>
                {profile.alternativeName}
              </h1>
              <p style={{ fontSize: 19, color: accentColor, fontWeight: 600, marginBottom: 7 }}>
                {displayTitle}
              </p>
              <p style={{ fontSize: 13, color: "var(--text3)", letterSpacing: "0.02em" }}>{universe.title} · {universe.recruiterFaction}</p>

              {/* Destiny scores — below the faction line */}
              <div style={{ display: "flex", gap: 12, marginTop: 22, maxWidth: 420 }}>
                {Object.entries(profile.radarScores || {}).slice(0, 3).map(([key, val]) => (
                  <div key={key} style={{
                    flex: 1, textAlign: "center", borderRadius: 14, padding: "18px 8px 14px",
                    background: "linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
                    border: `1px solid ${accentColor}2e`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", color: accentColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginTop: 8 }}>{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action bar — full-width row beneath the portrait + identity */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            <div style={{ flex: "2 1 240px", minWidth: 0 }}>
              <TipButton
                primary
                label="Begin Future Transmission →"
                tip="Talk to the version of you who already lived this life."
                color="#fff" bg="var(--violet)" border="var(--violet2)" accent="124,110,247"
                onClick={() => transitionTo("future-transmission", { selectedUniverse: state.selectedUniverse })}
              />
            </div>
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              {/* Recruiter — Royal Summons / Corp Offers / etc. */}
              <TipButton
                primary
                label={invitationLabel}
                tip={`The ${universe.recruiterFaction} of ${universe.title} want to recruit you. Read their offer.`}
                color={accentColor} bg={`${accentColor}14`} border={`${accentColor}40`} accent={accentRgb}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke={accentColor} strokeWidth="1.6" strokeLinejoin="round"/><path d="M4 7l8 6 8-6" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                onClick={() => transitionTo("multiverse-invitations")}
              />
            </div>
            <div style={{ flex: "1 1 140px", minWidth: 0 }}>
              <TipButton
                label="Legendary"
                tip="Meet your greatest possible self — if everything went right."
                color="#e8c97e" bg="rgba(232,201,126,0.1)" border="rgba(232,201,126,0.3)" accent="232,201,126"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17l2.5-8L9 13l3-7 3 7 3.5-4L21 17H3z" stroke="#e8c97e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h18" stroke="#e8c97e" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                onClick={() => { markActivity(state, updateState, state.selectedUniverse!, "legendary"); transitionTo("legendary-self"); }}
              />
            </div>
            <div style={{ flex: "1 1 140px", minWidth: 0 }}>
              <TipButton
                label="Shadow"
                tip="Face the self who chose ambition over everything."
                color="#f07070" bg="rgba(240,112,112,0.08)" border="rgba(240,112,112,0.3)" accent="240,112,112"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="#f07070" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                onClick={() => { markActivity(state, updateState, state.selectedUniverse!, "shadow"); transitionTo("villain-self"); }}
              />
            </div>
          </div>
        </motion.div>

        {/* World description — full, with room to breathe */}
        {profile.worldDescription && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{
              position: "relative", margin: "0 0 36px", padding: "22px 26px", borderRadius: 16, overflow: "hidden",
              background: solidPanels
                ? `linear-gradient(160deg, ${accentColor}1e, rgba(13,12,9,0.93) 58%, ${accentColor}14)`
                : `linear-gradient(160deg, ${accentColor}14, rgba(20,16,10,0.55) 58%, ${accentColor}0a)`,
              border: `1px solid ${accentColor}${solidPanels ? "40" : "33"}`,
              boxShadow: `inset 0 1px 0 ${accentColor}22, 0 14px 36px -18px rgba(0,0,0,0.9)`,
            }}>
            {/* Aged top sheen */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 64,
              background: `linear-gradient(${accentColor}12, transparent)`, pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                color: accentColor, whiteSpace: "nowrap", paddingTop: 5, flexShrink: 0 }}>
                The Realm
              </span>
              <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 16.5, lineHeight: 1.75,
                color: solidPanels ? "var(--text)" : "var(--text2)", margin: 0 }}>
                {clean(profile.worldDescription)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 36 }}>
          {/* Left column */}
          <div>
            {/* Biography — with large quote mark + drop gradient */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={cardStyle()}>
              {/* Accent glow */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${accentColor}18, transparent 70%)`, pointerEvents: "none" }} />
              {/* Big quote mark */}
              <div style={{ position: "absolute", top: 8, right: 24, fontSize: 80, lineHeight: 1, fontFamily: "Crimson Pro, serif", color: `${accentColor}20`, pointerEvents: "none" }}>&rdquo;</div>
              <SectionHeader label="Biography" />
              <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 18, lineHeight: 1.85, color: "var(--text)", fontWeight: 300, whiteSpace: "pre-wrap", position: "relative" }}>
                {clean(profile.biography)}
              </p>
            </motion.div>

            {/* Timeline Story — with left timeline rail */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={cardStyle()}>
              <SectionHeader label="Timeline Story" />
              <div style={{ position: "relative", paddingLeft: 20 }}>
                <span style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, borderRadius: 2, background: `linear-gradient(${accentColor}, transparent)` }} />
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text2)", whiteSpace: "pre-wrap" }}>{clean(profile.timelineStory)}</p>
              </div>
            </motion.div>

            {/* Career Trajectory — highlighted "next" card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={cardStyle({ background: `linear-gradient(135deg, ${accentColor}0d, var(--surface))`, borderColor: `${accentColor}30` })}>
              <SectionHeader label="Where They're Heading" />
              <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text2)" }}>{clean(profile.careerTrajectory)}</p>
            </motion.div>

            {/* Achievements — numbered badges */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={cardStyle({ marginBottom: 0 })}>
              <SectionHeader label="Achievements" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {profile.achievements.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: accentColor,
                      background: `${accentColor}15`, border: `1px solid ${accentColor}30`,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, paddingTop: 3 }}>{a}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div>
            {/* Personality */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={cardStyle({ padding: 24, marginBottom: 16 })}>
              <SectionHeader label="Personality" />
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{clean(profile.personalityProfile)}</p>
            </motion.div>

            {/* Competency bars */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={cardStyle({ padding: 24, marginBottom: 16 })}>
              <SectionHeader label="Competency Matrix" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(profile.radarScores || {}).map(([skill, score]) => (
                  <div key={skill}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text2)", textTransform: "capitalize" }}>{skill}</span>
                      <span style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>{score}</span>
                    </div>
                    <div style={{ height: 5, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`, boxShadow: `0 0 8px ${accentColor}66` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Competency tags */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={cardStyle({ padding: 24, marginBottom: 16 })}>
              <SectionHeader label="Skills" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.competencies.map((c, i) => (
                  <span key={i} style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: `${accentColor}12`, border: `1px solid ${accentColor}25`, color: accentColor,
                  }}>{c}</span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Replay Arrival link */}
        <div style={{ textAlign: "center", paddingBottom: 60, paddingTop: 8 }}>
          <button
            onClick={replayArrival}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "var(--text3)", fontFamily: "Sora, sans-serif",
              letterSpacing: "0.04em", padding: "8px 12px", minHeight: 44,
              transition: "color 0.15s", touchAction: "manipulation",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
          >
            ↺ Replay Arrival
          </button>
        </div>

      </div>
    </div>
  );
}

/* Action button with a hover tooltip describing what it does */
function TipButton({ label, tip, icon, color, bg, border, accent, primary, onClick }: {
  label: string; tip: string; icon?: React.ReactNode; color: string; bg: string; border: string;
  accent: string; primary?: boolean; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative", flex: primary ? undefined : 1, width: primary ? "100%" : undefined }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: "100%", padding: primary ? "14px 16px" : "11px 12px", borderRadius: 12,
          background: bg, border: `1px solid ${border}`, color,
          fontFamily: "Sora, sans-serif", fontSize: primary ? 14 : 13, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: hover ? `0 6px 20px -6px rgba(${accent},0.5)` : "none",
          transform: hover ? "translateY(-1px)" : "none",
        }}
      >
        {icon}{label}
      </button>
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 30,
              padding: "10px 12px", borderRadius: 10, pointerEvents: "none",
              background: "rgba(8,9,13,0.97)", border: `1px solid rgba(${accent},0.35)`,
              boxShadow: `0 8px 28px -8px rgba(${accent},0.4)`, backdropFilter: "blur(12px)",
            }}
          >
            {/* arrow */}
            <div style={{ position: "absolute", top: -5, left: primary ? 24 : "50%", marginLeft: primary ? 0 : -5, width: 9, height: 9,
              background: "rgba(8,9,13,0.97)", borderLeft: `1px solid rgba(${accent},0.35)`, borderTop: `1px solid rgba(${accent},0.35)`,
              transform: "rotate(45deg)" }} />
            <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, margin: 0, fontFamily: "Sora, sans-serif" }}>{tip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
