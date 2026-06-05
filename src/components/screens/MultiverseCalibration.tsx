"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState, ResumeAnalysis, AlternateProfile, UniverseType } from "@/types";
import { analyzeResume, generateProfile } from "@/lib/agents/useAgents";
import { getAllUniverses } from "@/lib/universes";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const steps = [
  "Extracting identity markers...",
  "Mapping timeline signature...",
  "Building Medieval Kingdom profile...",
  "Building Neon Synthesis profile...",
  "Building Endless Seas profile...",
  "Building Ancient Draconia profile...",
  "Building Cosmic Frontier profile...",
  "Building Eternal Night profile...",
  "Finalizing multiverse...",
];

export default function MultiverseCalibration({ state, transitionTo, updateState }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.resumeText) {
      transitionTo("upload-resume");
      return;
    }
    run();
  }, []);

  const run = async () => {
    try {
      // Agent 1: analyze resume
      setStepIndex(0);
      const analysis: ResumeAnalysis = await analyzeResume(state.resumeText!);
      setStepIndex(1);
      updateState({ resumeAnalysis: analysis });

      // Agent 2: generate all 6 universe profiles in parallel
      const universes = getAllUniverses();
      const profilePromises = universes.map((u, i) =>
        generateProfile(analysis, u.id).then((profile) => {
          setStepIndex(2 + i);
          return [u.id, profile] as [UniverseType, AlternateProfile];
        })
      );

      const profileEntries = await Promise.all(profilePromises);
      const allProfiles = Object.fromEntries(profileEntries) as Record<UniverseType, AlternateProfile>;

      setStepIndex(8);
      updateState({ allProfiles });

      setTimeout(() => {
        transitionTo("universe-discovery", { resumeAnalysis: analysis, allProfiles });
      }, 800);
    } catch (err: any) {
      console.error("Calibration error:", err);
      setError(err.message || "Something went wrong. Check your API keys and try again.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </span>
      </nav>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", maxWidth: 440, width: "100%", padding: "0 24px" }}
      >
        {error ? (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--rose2)" }}>
              Calibration Failed
            </h2>
            <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={() => transitionTo("upload-resume")}
              style={{
                padding: "12px 28px", borderRadius: 10,
                background: "var(--violet)", border: "none",
                color: "#fff", fontFamily: "Sora, sans-serif",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              ← Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Orb */}
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 40px" }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "radial-gradient(circle, var(--violet) 0%, var(--violet3) 50%, transparent 100%)",
                animation: "pulse-glow 2s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                border: "1px solid rgba(124,110,247,0.3)",
                animation: "spin-slow 4s linear infinite",
              }} />
              <div style={{
                position: "absolute", inset: -16, borderRadius: "50%",
                border: "1px dashed rgba(124,110,247,0.15)",
                animation: "spin-slow 8s linear infinite reverse",
              }} />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
              Calibrating your multiverse
            </h2>

            <div style={{ height: 28, overflow: "hidden", marginBottom: 40 }}>
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 15, color: "var(--text2)" }}
              >
                {steps[stepIndex]}
              </motion.p>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: "var(--surface3)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
              <motion.div
                animate={{ width: `${Math.round((stepIndex / (steps.length - 1)) * 100)}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--violet), var(--cyan))",
                  borderRadius: 4,
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)" }}>
              {Math.round((stepIndex / (steps.length - 1)) * 100)}% complete
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
