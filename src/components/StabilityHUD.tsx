"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTier } from "@/lib/stability";

export function StabilityHUD({ stability }: { stability: number }) {
  const tier = getTier(stability);
  const critical = tier.status === "critical" || tier.status === "collapse";
  const [hover, setHover] = useState(false);

  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "default",
          padding: "6px 12px", borderRadius: 100,
          background: "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}33`,
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: tier.color, flexShrink: 0,
          boxShadow: `0 0 8px ${tier.color}`,
          animation: critical ? "pulse-glow 1.2s infinite" : "none",
        }} />
        <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.04em" }}>Timeline</span>
        <div style={{ width: 64, height: 4, borderRadius: 4, background: "var(--surface3)", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${stability}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: "100%", background: tier.color, borderRadius: 4 }}
          />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: tier.color, fontVariantNumeric: "tabular-nums", minWidth: 34, textAlign: "right" }}>
          {stability}%
        </span>
      </div>

      {/* Hover description card */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 60, width: 240,
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              background: "rgba(14,16,24,0.97)", border: `1px solid ${tier.color}44`,
              backdropFilter: "blur(12px)", boxShadow: `0 12px 40px -12px ${tier.color}55`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: tier.color, letterSpacing: "0.02em" }}>{tier.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>{stability}%</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.55 }}>{tier.effect}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-width warning banner shown at low stability. */
export function TimelineWarningBanner({ stability }: { stability: number }) {
  const tier = getTier(stability);
  if (tier.status === "stable") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 45,
        background: `${tier.color}14`, borderBottom: `1px solid ${tier.color}40`,
        backdropFilter: "blur(10px)", padding: "8px 40px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}
    >
      <span style={{ color: tier.color, fontSize: 13, fontWeight: 600,
        animation: tier.status === "collapse" ? "glitch-flicker 1.5s infinite" : "none" }}>
        ⚠ {tier.label}
      </span>
      <span style={{ color: "var(--text3)", fontSize: 12 }}>{tier.effect}</span>
    </motion.div>
  );
}
