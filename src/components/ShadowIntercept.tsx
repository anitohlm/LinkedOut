"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getShadowIntercept } from "@/lib/agents/useAgents";

interface Props {
  firstName: string;
  futureMeAdvice: string;
  onClose: () => void;
}

const RED = "#f07070";

export default function ShadowIntercept({ firstName, futureMeAdvice, onClose }: Props) {
  const [phase, setPhase] = useState<"alarm" | "transmission">("alarm");
  const [lines, setLines] = useState<string[]>([]);
  const [shown, setShown] = useState<string[]>([]);
  const [revealAfter, setRevealAfter] = useState(4);
  const [identity, setIdentity] = useState<{ name: string; timeline: string; classification: string } | null>(null);
  const [interceptedLine, setInterceptedLine] = useState<string | null>(null);
  const [showIntercepted, setShowIntercepted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const hasInit = useRef(false);

  // Load villain content
  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    (async () => {
      try {
        const data = await getShadowIntercept({ futureMeAdvice, firstName });
        setLines(data.lines);
        setRevealAfter(data.revealAfter ?? 4);
        setIdentity(data.identity);
        setInterceptedLine((data as any).interceptedLine || null);
      } catch {
        setLines([
          "Don't listen to her.",
          "She keeps telling you patience matters.",
          "I chose differently.",
          "Look how far I got.",
        ]);
        setIdentity({ name: `Empress ${firstName || "Ascendant"} Ascendant`, timeline: "Omega-13", classification: "Shadow Self" });
      }
    })();
  }, []);

  // Alarm → show intercepted line → transmission
  useEffect(() => {
    const t1 = setTimeout(() => setShowIntercepted(true), 1400);
    const t2 = setTimeout(() => setPhase("transmission"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Reveal lines one at a time
  useEffect(() => {
    if (phase !== "transmission" || !lines.length) return;
    if (shown.length >= lines.length) { setDone(true); return; }
    const t = setTimeout(() => {
      const next = shown.length + 1;
      setShown(lines.slice(0, next));
      if (next === revealAfter) setRevealed(true);
    }, shown.length === 0 ? 600 : 1600);
    return () => clearTimeout(t);
  }, [phase, lines, shown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "radial-gradient(ellipse at 50% 30%, #1a0808, #050203 70%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Static noise layer */}
      <div style={{
        position: "absolute", inset: "-10%", opacity: 0.06, pointerEvents: "none",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        animation: "static-shift 0.3s steps(3) infinite",
      }} />
      {/* Scanlines */}
      <div className="scanlines" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }} />
      {/* Red vignette pulse */}
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none",
          boxShadow: `inset 0 0 200px 40px rgba(240,112,112,0.35)` }}
      />

      <AnimatePresence mode="wait">
        {phase === "alarm" ? (
          /* ── ALARM PHASE ── */
          <motion.div key="alarm"
            initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 32px", maxWidth: 580, width: "100%" }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ fontSize: 56, marginBottom: 20 }}>⚠</motion.div>
            <h1 className="glitch-text" style={{
              fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 800, letterSpacing: "0.05em",
              color: "#fff", marginBottom: 12, textTransform: "uppercase",
            }}>
              Transmission Interrupted
            </h1>
            <p style={{ fontSize: 13, color: RED, letterSpacing: "0.15em", textTransform: "uppercase",
              animation: "glitch-flicker 1.5s infinite", marginBottom: 28 }}>
              Unknown Temporal Signature Detected
            </p>

            {/* Intercepted line — replayed by the watcher */}
            <AnimatePresence>
              {showIntercepted && interceptedLine && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "rgba(240,112,112,0.06)", border: `1px solid ${RED}33`,
                    borderLeft: `3px solid ${RED}88`,
                    borderRadius: 8, padding: "14px 18px", textAlign: "left",
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                    color: `${RED}88`, marginBottom: 8, fontFamily: "Sora, sans-serif" }}>
                    ◉ Intercepted Signal · Replaying
                  </p>
                  <p style={{
                    fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 16,
                    color: "rgba(255,255,255,0.55)", lineHeight: 1.6,
                    animation: "glitch-flicker 3s infinite",
                  }}>
                    &ldquo;{interceptedLine}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── TRANSMISSION PHASE ── */
          <motion.div key="tx"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ width: "100%", maxWidth: 620, padding: "0 32px", position: "relative", zIndex: 2 }}>

            {/* Sender header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20,
              borderBottom: `1px solid ${RED}33` }}>
              {/* Distorted portrait */}
              <motion.div
                animate={{ x: [0, -1.5, 1.5, 0] }} transition={{ duration: 0.3, repeat: Infinity }}
                style={{
                  width: 60, height: 60, borderRadius: 14, flexShrink: 0, position: "relative", overflow: "hidden",
                  background: revealed
                    ? `linear-gradient(135deg, ${RED}, #5a1a1a)`
                    : "linear-gradient(135deg, #2a2a2a, #111)",
                  border: `1px solid ${RED}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  filter: "contrast(1.2) saturate(0.7)",
                }}>
                <span style={{ fontSize: 28, filter: "blur(1px)", opacity: revealed ? 1 : 0.5 }}>
                  {revealed ? "🌑" : "?"}
                </span>
                <div className="scanlines" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
              </motion.div>

              <div style={{ flex: 1 }}>
                <AnimatePresence mode="wait">
                  {!revealed ? (
                    <motion.div key="unknown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="glitch-text" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Unknown Sender</div>
                      <div style={{ fontSize: 12, color: RED, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2,
                        animation: "glitch-flicker 2s infinite" }}>Signal Tracing…</div>
                    </motion.div>
                  ) : (
                    <motion.div key="id" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: RED, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3 }}>
                        ◉ Identity Confirmed
                      </div>
                      <div className="glitch-text" style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>
                        {identity?.name}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, fontFamily: "monospace" }}>
                        Timeline: {identity?.timeline} · Classification: <span style={{ color: RED }}>{identity?.classification}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Villain lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 200 }}>
              <AnimatePresence>
                {shown.map((line, i) => (
                  <motion.p key={i}
                    initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                    style={{
                      fontSize: i >= revealAfter ? 17 : 19, fontWeight: i >= revealAfter ? 400 : 600,
                      lineHeight: 1.5, color: i >= revealAfter ? "rgba(255,255,255,0.85)" : "#fff",
                      fontFamily: i >= revealAfter ? "Crimson Pro, serif" : "Sora, sans-serif",
                      fontStyle: i >= revealAfter ? "italic" : "normal",
                      textShadow: `0 0 20px ${RED}40`,
                    }}>
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
              {!done && shown.length > 0 && (
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ width: 8, height: 18, background: RED, display: "inline-block" }} />
              )}
            </div>

            {/* Dismiss */}
            {done && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ marginTop: 36, display: "flex", gap: 12 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: "14px", borderRadius: 10, cursor: "pointer",
                    background: RED, border: "none", color: "#0a0a0a",
                    fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.02em" }}>
                  ✕ Sever the Connection
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
