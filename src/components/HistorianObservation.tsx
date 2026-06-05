"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const GOLD = "#e8c97e";

export default function HistorianObservation({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 7000);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.6 }}
      onClick={onDone}
      style={{
        position: "fixed", top: 110, left: "50%", transform: "translateX(-50%)", zIndex: 950,
        width: "min(560px, calc(100vw - 48px))", cursor: "pointer",
      }}
    >
      <div style={{
        position: "relative", overflow: "hidden",
        background: "rgba(10,11,16,0.92)", backdropFilter: "blur(16px)",
        border: `1px solid ${GOLD}33`, borderLeft: `2px solid ${GOLD}`,
        borderRadius: 16, padding: "18px 22px",
        boxShadow: `0 12px 48px -16px ${GOLD}40`,
      }}>
        {/* faint star drift */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
          background: `radial-gradient(circle at 85% 20%, ${GOLD}14, transparent 50%)`,
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, position: "relative" }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 180, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ color: GOLD, fontSize: 13 }}>✦</motion.span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD }}>
            Historian Observation
          </span>
        </div>
        <p style={{
          fontFamily: "Crimson Pro, serif", fontSize: 16, lineHeight: 1.65, fontStyle: "italic",
          color: "var(--text2)", position: "relative",
        }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}
