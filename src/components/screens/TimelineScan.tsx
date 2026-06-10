"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { SpiralAnimation } from "@/components/ui/spiral-animation";

interface TimelineScanProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const steps = [
  "Generating alternate timeline",
  "Building employers & organizations",
  "Creating achievements & milestones",
  "Summoning character references",
  "Calculating destiny scores",
];

const messages = [
  "Generating alternate timeline...",
  "Building employers...",
  "Creating achievements...",
  "Summoning recommendations...",
  "Calculating destiny...",
];

export default function TimelineScan({ transitionTo }: TimelineScanProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [currentMsg, setCurrentMsg] = useState(messages[0]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) {
        setActiveStep(i);
        setCurrentMsg(messages[i]);
      } else {
        clearInterval(iv);
        setDone(true);
        setTimeout(() => transitionTo("multiverse-calibration"), 800);
      }
    }, 700);
    return () => clearInterval(iv);
  }, [transitionTo]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      paddingTop: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Spiral animation — full-screen background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <SpiralAnimation />
      </div>

      {/* Dark overlay to keep UI readable */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)",
      }} />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", padding: "0 40px",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </button>
      </nav>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 400, width: "100%", padding: "0 24px" }}
      >
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

        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
          Building your multiverse
        </h2>

        {/* Rotating message */}
        <div style={{ height: 28, overflow: "hidden", marginBottom: 40 }}>
          <motion.p
            key={currentMsg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 15, color: "var(--text2)" }}
          >
            {currentMsg}
          </motion.p>
        </div>

        {/* Steps list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          {steps.map((step, idx) => {
            const isDone = idx < activeStep;
            const isActive = idx === activeStep;
            return (
              <div
                key={idx}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  background: isActive ? "rgba(124,110,247,0.05)" : "var(--surface)",
                  border: `1px solid ${isActive ? "var(--violet)" : "var(--border)"}`,
                  borderRadius: 12,
                  fontSize: 13,
                  color: isActive ? "var(--text)" : isDone ? "var(--text2)" : "var(--text3)",
                  transition: "all 0.3s",
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: isDone ? "var(--cyan)" : isActive ? "var(--violet2)" : "var(--border2)",
                  animation: isActive ? "pulse-glow 1s infinite" : "none",
                  transition: "background 0.3s",
                }} />
                {step}
              </div>
            );
          })}
        </div>

        {done && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 32, fontSize: 18, fontWeight: 700, color: "var(--violet2)" }}
          >
            You have been linked out.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
