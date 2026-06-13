"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getShadowIntercept } from "@/lib/agents/useAgents";

interface Props {
  universeId: string;
  futureMeAdvice: string;
  priorEncounters?: string[]; // universe ids the Shadow has already manifested in
  onClose: (choice: "ignore" | "hear") => void;
}

const RED = "#f07070";

export default function ShadowIntercept({ universeId, futureMeAdvice, priorEncounters, onClose }: Props) {
  const [phase, setPhase] = useState<"alarm" | "message">("alarm");
  const [data, setData] = useState<{ manifestation: { name: string; classification: string }; observation: string; question: string } | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    (async () => {
      try {
        setData(await getShadowIntercept({ universeId, futureMeAdvice, priorEncounters }));
      } catch {
        setData({
          manifestation: { name: "The Hollow Witness", classification: "Shadow Manifestation" },
          observation: "You keep everyone at arm's length.",
          question: "Who actually knows you anymore?",
        });
      }
    })();
  }, []);

  // Brief alarm, then the message
  useEffect(() => {
    const t = setTimeout(() => setPhase("message"), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundImage: "url('/universe-art/shadow.png')",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}
    >
      {/* Dark overlay to keep text readable and mood menacing */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, rgba(26,8,8,0.55), rgba(5,2,3,0.82) 70%)", pointerEvents: "none" }} />
      {/* Static + scanlines + vignette */}
      <div style={{ position: "absolute", inset: "-10%", opacity: 0.06, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        animation: "static-shift 0.3s steps(3) infinite" }} />
      <div className="scanlines" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }} />
      <motion.div animate={{ opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `inset 0 0 200px 40px rgba(240,112,112,0.35)` }} />

      <AnimatePresence mode="wait">
        {phase === "alarm" || !data ? (
          <motion.div key="alarm" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 32px" }}>
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 20h20L12 3z" stroke={RED} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 10v4" stroke={RED} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill={RED}/>
              </svg>
            </motion.div>
            <h1 className="glitch-text" style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", textTransform: "uppercase" }}>
              Transmission Interrupted
            </h1>
          </motion.div>
        ) : (
          <motion.div key="msg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: "100%", maxWidth: 520, padding: "0 32px", position: "relative", zIndex: 2 }}>
            {/* Manifestation header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${RED}33` }}>
              <motion.div animate={{ x: [0, -1.5, 1.5, 0] }} transition={{ duration: 0.3, repeat: Infinity }}
                style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, position: "relative", overflow: "hidden",
                  background: `linear-gradient(135deg, ${RED}, #5a1a1a)`, border: `1px solid ${RED}55`,
                  display: "flex", alignItems: "center", justifyContent: "center", filter: "contrast(1.2) saturate(0.7)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill={RED} opacity="0.15" stroke={RED} strokeWidth="1.2"/>
                  <path d="M15.5 8.5A5 5 0 009 14a5 5 0 006.5-5.5z" fill={RED} opacity="0.7"/>
                </svg>
                <div className="scanlines" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
              </motion.div>
              <div>
                <div className="glitch-text" style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{data.manifestation.name}</div>
                <div style={{ fontSize: 10.5, color: RED, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
                  {data.manifestation.classification}
                </div>
              </div>
            </div>

            {/* Brief observation + accusation */}
            <p style={{ fontSize: 19, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 10, textShadow: `0 0 20px ${RED}40` }}>
              {data.observation}
            </p>
            <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.85)", lineHeight: 1.45, marginBottom: 32 }}>
              {data.question}
            </p>

            {/* Two choices */}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => onClose("ignore")}
                style={{ flex: 1, padding: "14px", borderRadius: 11, cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(78,205,196,0.5)", color: "#4ecdc4",
                  fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 700 }}>
                Ignore <span style={{ fontWeight: 500, opacity: 0.8 }}>· +5 stability</span>
              </button>
              <button onClick={() => onClose("hear")}
                style={{ flex: 1, padding: "14px", borderRadius: 11, cursor: "pointer",
                  background: RED, border: "none", color: "#0a0a0a",
                  fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 700 }}>
                Hear Them Out <span style={{ fontWeight: 500, opacity: 0.75 }}>· −10</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
