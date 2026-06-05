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
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </span>
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

        {/* Universe cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {universes.map((universe, i) => {
            const profile = state.allProfiles?.[universe.id];
            return (
              <motion.div
                key={universe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => transitionTo("identity-reconstruction", { selectedUniverse: universe.id })}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: 28,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                whileHover={{ borderColor: universe.color, y: -4 }}
              >
                {/* Universe emoji + name */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ fontSize: 32 }}>{universe.emoji}</div>
                  <span style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 100, fontWeight: 500,
                    background: `${universe.color}18`, color: universe.color,
                    border: `1px solid ${universe.color}30`,
                  }}>
                    {universe.title}
                  </span>
                </div>

                {profile ? (
                  <>
                    <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 4, color: "var(--text)" }}>
                      {profile.alternativeName}
                    </h3>
                    <p style={{ fontSize: 13, color: universe.color, fontWeight: 500, marginBottom: 12 }}>
                      {profile.profession}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 16 }}>
                      {profile.biography?.split("\n")[0]?.slice(0, 120)}...
                    </p>
                    {/* Radar scores */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {Object.entries(profile.radarScores || {}).slice(0, 3).map(([key, val]) => (
                        <div key={key} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: universe.color }}>{val}</div>
                          <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</div>
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
