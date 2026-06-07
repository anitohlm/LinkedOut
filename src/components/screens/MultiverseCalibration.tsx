"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, ResumeAnalysis, AlternateProfile, UniverseType } from "@/types";
import { analyzeResume, generateProfile } from "@/lib/agents/useAgents";
import { getAllUniverses } from "@/lib/universes";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const UNIVERSE_COLORS: Record<string, string> = {
  medieval: "#e8c97e",
  cyberpunk: "#4ecdc4",
  pirate: "#f07070",
  dragon: "#f0a050",
  galactic: "#7c6ef7",
  vampire: "#e879a0",
};

export default function MultiverseCalibration({ state, transitionTo, updateState }: Props) {
  const [phase, setPhase] = useState<"analyzing" | "building">("analyzing");
  const [stepIndex, setStepIndex] = useState(0);
  const [completedUniverses, setCompletedUniverses] = useState<string[]>([]);
  const [activeUniverse, setActiveUniverse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const universes = getAllUniverses();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // guard against React Strict Mode double-invoke
    hasRun.current = true;
    if (!state.resumeText) { transitionTo("upload-resume"); return; }
    run();
  }, []);

  const run = async () => {
    try {
      // Clear ALL data from any previous run — a new resume = a fresh multiverse
      updateState({
        allProfiles: {} as any, allFutureSelves: {} as any, resumeAnalysis: null, selectedUniverse: null,
        transmissions: {}, interviews: {}, cachedInvitations: {}, invitationDecisions: {},
        councilMessages: [], councilSpecials: [], councilConcluded: false,
        explored: [], usedButterfly: false, universeActivity: {},
        shadowCuriosity: 0, lastInterceptTurn: -99,
        timelineState: { stability: 100, status: "stable" },
      });

      // Phase 1: Analyze resume
      setPhase("analyzing");
      setProgress(5);
      const analysis: ResumeAnalysis = await analyzeResume(state.resumeText!);
      updateState({ resumeAnalysis: analysis });
      setProgress(15);
      setPhase("building");

      // Phase 2: Generate all 6 profiles sequentially for visual effect
      const allProfiles: Partial<Record<UniverseType, AlternateProfile>> = {};
      for (let i = 0; i < universes.length; i++) {
        const u = universes[i];
        setActiveUniverse(u.id);
        setStepIndex(i);
        const profile = await generateProfile(analysis, u.id);
        allProfiles[u.id] = profile;
        setCompletedUniverses(prev => [...prev, u.id]);
        setProgress(15 + Math.round(((i + 1) / universes.length) * 85));
      }

      setActiveUniverse(null);
      setProgress(100);

      setTimeout(() => {
        transitionTo("universe-discovery", {
          resumeAnalysis: analysis,
          allProfiles: allProfiles as Record<UniverseType, AlternateProfile>,
        });
      }, 1200);
    } catch (err: any) {
      console.error("Calibration error:", err);
      setError(err.message || "Something went wrong. Check your API keys and try again.");
    }
  };

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", maxWidth: 440, padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--rose2)" }}>Calibration Failed</h2>
          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <button onClick={() => transitionTo("upload-resume")} style={{
            padding: "12px 28px", borderRadius: 10, background: "var(--violet)",
            border: "none", color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>← Try Again</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>

      {/* Animated background blobs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "rgba(124,110,247,0.2)", filter: "blur(100px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity }}
        style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "rgba(78,205,196,0.15)", filter: "blur(80px)", top: "30%", right: "20%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 680, padding: "0 24px" }}>

        {/* Phase label */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
              background: "rgba(124,110,247,0.15)", border: "1px solid rgba(124,110,247,0.3)",
              borderRadius: 100, fontSize: 11, color: "var(--violet2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet2)", display: "inline-block", animation: "pulse-glow 1.5s infinite" }} />
            {phase === "analyzing" ? "Extracting Identity" : "Building Multiverse"}
          </motion.div>

          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>
            {phase === "analyzing" ? "Reading your timeline..." : "Calibrating your multiverse"}
          </h2>
          <p style={{ fontSize: 15, color: "var(--text3)" }}>
            {phase === "analyzing"
              ? "Extracting the identity hidden within your resume"
              : `Building ${universes[stepIndex]?.title || "alternate realities"}...`}
          </p>
        </motion.div>

        {/* Universe orbs grid */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 48, flexWrap: "wrap" }}>
          {universes.map((u, i) => {
            const isDone = completedUniverses.includes(u.id);
            const isActive = activeUniverse === u.id;
            const color = UNIVERSE_COLORS[u.id];

            return (
              <motion.div key={u.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: phase === "building" ? 1 : 0.3, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

                {/* Orb */}
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  {/* Outer ring — active pulse */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: "absolute", inset: -8, borderRadius: "50%",
                        border: `2px solid ${color}`, pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Spinning ring — active */}
                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      style={{
                        position: "absolute", inset: -4, borderRadius: "50%",
                        border: `1.5px dashed ${color}80`, pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Main orb */}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      background: isDone
                        ? `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`
                        : isActive
                        ? `radial-gradient(circle at 35% 35%, ${color}88, ${color}22)`
                        : "var(--surface)",
                      border: `1px solid ${isDone || isActive ? color + "60" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28,
                      boxShadow: isDone ? `0 0 24px ${color}40` : isActive ? `0 0 16px ${color}30` : "none",
                      transition: "all 0.4s",
                    }}
                  >
                    {isDone ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        {u.emoji}
                      </motion.span>
                    ) : (
                      <span style={{ opacity: isActive ? 1 : 0.3 }}>{u.emoji}</span>
                    )}
                  </motion.div>
                </div>

                {/* Label */}
                <div style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
                  color: isDone ? color : isActive ? "var(--text2)" : "var(--text3)",
                  textAlign: "center", maxWidth: 72, lineHeight: 1.3,
                  transition: "color 0.3s",
                }}>
                  {u.title.split(" ")[0]}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 3, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--violet), var(--cyan))",
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        {/* Progress text */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${phase}-${stepIndex}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 12, color: "var(--text3)" }}
            >
              {phase === "analyzing"
                ? "Scanning identity markers..."
                : completedUniverses.length === universes.length
                ? "Multiverse ready."
                : `${completedUniverses.length} of ${universes.length} universes built`}
            </motion.p>
          </AnimatePresence>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
