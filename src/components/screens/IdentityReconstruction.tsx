"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    if (!state.selectedUniverse || !profile) { transitionTo("universe-discovery"); return; }
    markActivity(state, updateState, state.selectedUniverse, "profile");
  }, []);

  if (!profile || !universe) return null;

  const accentColor = universe.color;
  const accentRgb = (() => {
    const h = accentColor.replace("#", "");
    const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return [r, g, b].some(isNaN) ? "124,110,247" : `${r},${g},${b}`;
  })();
  const acceptedPosition = (state.acceptedPositions || []).find(p => p.universeId === state.selectedUniverse);
  const displayTitle = acceptedPosition?.title ?? profile.profession;

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
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );

  const cardStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
    ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: -6, borderRadius: 26,
              background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{
              width: 80, height: 80, borderRadius: 22, flexShrink: 0,
              background: `linear-gradient(145deg, ${accentColor}35 0%, ${accentColor}15 60%, transparent 100%)`,
              border: `1px solid ${accentColor}55`,
              boxShadow: `0 8px 32px -8px ${accentColor}70, inset 0 1px 0 ${accentColor}45`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -12, left: -12, width: 50, height: 50,
                background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <UniverseIcon id={universe.id} size={36} color={accentColor} strokeWidth={1.4} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 4, color: "var(--text)" }}>
              {profile.alternativeName}
            </h1>
            <p style={{ fontSize: 16, color: accentColor, fontWeight: 500, marginBottom: 4 }}>
              {displayTitle}
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>{universe.title} · {universe.recruiterFaction}</p>

            {/* Destiny scores — below the faction line */}
            <div style={{ display: "flex", gap: 12, marginTop: 16, maxWidth: 360 }}>
              {Object.entries(profile.radarScores || {}).slice(0, 3).map(([key, val]) => (
                <div key={key} style={{
                  flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "14px 8px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-1px", color: accentColor }}>{val}</div>
                  <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text3)", marginTop: 4 }}>{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons (right side) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320, flexShrink: 0 }}>
            {/* primary + secondary actions */}
            <TipButton
              primary
              label="Begin Future Transmission →"
              tip="Talk to the version of you who already lived this life."
              color="#fff" bg="var(--violet)" border="var(--violet2)" accent="124,110,247"
              onClick={() => transitionTo("future-transmission", { selectedUniverse: state.selectedUniverse })}
            />
            {/* Recruiter — Royal Summons / Corp Offers / etc. */}
            <TipButton
              primary
              label={invitationLabel}
              tip={`The ${universe.recruiterFaction} of ${universe.title} want to recruit you. Read their offer.`}
              color={accentColor} bg={`${accentColor}14`} border={`${accentColor}40`} accent={accentRgb}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke={accentColor} strokeWidth="1.6" strokeLinejoin="round"/><path d="M4 7l8 6 8-6" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              onClick={() => transitionTo("multiverse-invitations")}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <TipButton
                label="Legendary"
                tip="Meet your greatest possible self — if everything went right."
                color="#e8c97e" bg="rgba(232,201,126,0.1)" border="rgba(232,201,126,0.3)" accent="232,201,126"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17l2.5-8L9 13l3-7 3 7 3.5-4L21 17H3z" stroke="#e8c97e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h18" stroke="#e8c97e" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                onClick={() => { markActivity(state, updateState, state.selectedUniverse!, "legendary"); transitionTo("legendary-self"); }}
              />
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
              display: "flex", gap: 16, alignItems: "flex-start",
              margin: "0 0 36px", padding: "20px 24px", borderRadius: 16,
              background: `linear-gradient(135deg, ${accentColor}0d, var(--surface))`,
              border: `1px solid ${accentColor}22`, borderLeft: `3px solid ${accentColor}`,
            }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: accentColor, whiteSpace: "nowrap", paddingTop: 4, flexShrink: 0 }}>
              The Realm
            </span>
            <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 16, lineHeight: 1.7,
              color: "var(--text2)", margin: 0 }}>
              {clean(profile.worldDescription)}
            </p>
          </motion.div>
        )}

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
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
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <SectionHeader label="Personality" />
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{clean(profile.personalityProfile)}</p>
            </motion.div>

            {/* Competency bars */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <SectionHeader label="Competency Matrix" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(profile.radarScores || {}).map(([skill, score]) => (
                  <div key={skill}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text2)", textTransform: "capitalize" }}>{skill}</span>
                      <span style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>{score}</span>
                    </div>
                    <div style={{ height: 3, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{ height: "100%", background: accentColor, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Competency tags */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
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
