"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { getUniverse } from "@/lib/universes";
import UniverseBackground from "@/components/UniverseBackground";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

export default function IdentityReconstruction({ state, transitionTo, updateState }: Props) {
  const profile = state.selectedUniverse ? state.allProfiles?.[state.selectedUniverse] ?? null : null;
  const universe = state.selectedUniverse ? getUniverse(state.selectedUniverse) : null;

  useEffect(() => {
    if (!state.selectedUniverse || !profile) transitionTo("universe-discovery");
  }, []);

  if (!profile || !universe) return null;

  const accentColor = universe.color;

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
      {/* Themed universe background */}
      <UniverseBackground universeId={universe.id} color={accentColor} />

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
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </span>
        <span style={{ fontSize: 13, color: "var(--text3)" }}>
          {universe.emoji} {universe.title}
        </span>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}
        >
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
            border: `1px solid ${accentColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
          }}>
            {universe.emoji}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 4, color: "var(--text)" }}>
              {profile.alternativeName}
            </h1>
            <p style={{ fontSize: 16, color: accentColor, fontWeight: 500, marginBottom: 4 }}>
              {profile.profession}
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>{universe.title} · {universe.recruiterFaction}</p>
          </div>

          {/* Destiny scores */}
          <div style={{ display: "flex", gap: 16 }}>
            {Object.entries(profile.radarScores || {}).slice(0, 3).map(([key, val]) => (
              <div key={key} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "16px 12px", textAlign: "center", minWidth: 72,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-1px", color: accentColor }}>{val}</div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text3)", marginTop: 4 }}>{key}</div>
              </div>
            ))}
          </div>
        </motion.div>

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

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => transitionTo("future-transmission", { selectedUniverse: state.selectedUniverse })}
                style={{
                  width: "100%", padding: 16, borderRadius: 12,
                  background: "var(--violet)", border: "none",
                  color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--violet2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--violet)"; }}
              >
                Begin Future Transmission →
              </button>
              <button
                onClick={() => transitionTo("universe-discovery")}
                style={{
                  width: "100%", padding: 12, borderRadius: 12,
                  background: "transparent", border: "1px solid var(--border2)",
                  color: "var(--text2)", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ← Choose Another Universe
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
