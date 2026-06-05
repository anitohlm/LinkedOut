"use client";

import { motion } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getAllUniverses } from "@/lib/universes";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

export default function UniverseDiscovery({ state, transitionTo }: Props) {
  const universes = getAllUniverses();
  const profileCount = Object.keys(state.allProfiles || {}).length;
  const allReady = profileCount === universes.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => {
            if (!confirm("Start over with a new resume? This clears your current multiverse.")) return;
            transitionTo("upload-resume", {
              resumeText: null, resumeAnalysis: null, selectedUniverse: null,
              allProfiles: {} as any, allFutureSelves: {} as any, conversations: {} as any,
              timelineState: { stability: 100, status: "stable" },
            });
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 500,
            cursor: "pointer", background: "none", border: "none", color: "var(--text2)",
            fontFamily: "Sora, sans-serif", transition: "color 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
        >
          ↻ New Resume
        </button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </button>
        <span style={{ fontSize: 13, color: "var(--text3)" }}>
          Timeline Stability: <span style={{ color: "var(--cyan2)" }}>{state.timelineState.stability}%</span>
        </span>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
            Your Multiverse
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
            Meet the people you could have become.
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 16 }}>
            {state.resumeAnalysis?.timelineSignature}
          </p>
        </motion.div>

        {/* Journey actions */}
        {allReady && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
            <button onClick={() => transitionTo("butterfly-effect")}
              style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer",
                background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)",
                fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--violet)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)"; }}>
              🦋 What If? <span style={{ color: "var(--text3)", fontWeight: 400 }}>· Butterfly Effect</span>
            </button>
            <button onClick={() => transitionTo("council-of-selves")}
              style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer",
                background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)",
                fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--violet)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)"; }}>
              ⚖️ Council of Selves <span style={{ color: "var(--text3)", fontWeight: 400 }}>· The Finale</span>
            </button>
          </motion.div>
        )}

        {/* Universe cards */}
        {!allReady && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
            Loading universes...
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, perspective: "1200px" }}>
          {allReady && universes.map((universe, i) => {
            const profile = state.allProfiles?.[universe.id];
            const c = universe.color;
            return (
              <motion.div
                key={universe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => transitionTo("identity-reconstruction", { selectedUniverse: universe.id })}
                whileHover={{ y: -6, rotateX: 3, rotateY: -3, scale: 1.02 }}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: 28,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transformStyle: "preserve-3d",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${c}55`;
                  el.style.boxShadow = `0 16px 50px -12px ${c}40`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Accent corner glow */}
                <div style={{
                  position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%",
                  background: `radial-gradient(circle, ${c}22, transparent 70%)`, pointerEvents: "none",
                }} />
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 24, right: 24, height: 2,
                  background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.5,
                }} />

                {/* Universe emoji + name */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `linear-gradient(135deg, ${c}30, ${c}12)`, border: `1px solid ${c}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  }}>{universe.emoji}</div>
                  <span style={{
                    fontSize: 11, padding: "5px 12px", borderRadius: 100, fontWeight: 600,
                    background: `${c}18`, color: c, border: `1px solid ${c}30`,
                    letterSpacing: "0.02em",
                  }}>
                    {universe.title}
                  </span>
                </div>

                {profile ? (
                  <>
                    <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 4, color: "var(--text)" }}>
                      {profile.alternativeName}
                    </h3>
                    <p style={{ fontSize: 13, color: c, fontWeight: 500, marginBottom: 14, lineHeight: 1.4 }}>
                      {profile.profession}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
                      {(profile.biography || "").replace(/\\n/g, " ").slice(0, 120)}...
                    </p>
                    {/* Radar scores */}
                    <div style={{ display: "flex", gap: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      {Object.entries(profile.radarScores || {}).slice(0, 3).map(([key, val]) => (
                        <div key={key} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: c, letterSpacing: "-0.5px" }}>{val}</div>
                          <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{key}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--text3)", fontSize: 13 }}>Loading profile...</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
