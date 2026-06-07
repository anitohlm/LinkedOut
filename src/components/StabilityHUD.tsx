"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTier } from "@/lib/stability";

const GOLD = "#e8c97e";

export function StabilityHUD({ stability, log }: { stability: number; log?: { text: string; ts: number }[] }) {
  const tier = getTier(stability);
  const critical = tier.status === "critical" || tier.status === "collapse";
  const [hover, setHover] = useState(false);
  const [showLog, setShowLog] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

      {/* Historian Logs */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowLog(v => !v)}
          title="Historian's Log"
          style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            padding: "6px 12px", borderRadius: 100, fontFamily: "Sora, sans-serif", fontSize: 12,
            background: showLog ? `${GOLD}18` : "rgba(255,255,255,0.03)",
            border: `1px solid ${GOLD}${showLog ? "66" : "33"}`, color: GOLD,
          }}
        >
          ✦ <span style={{ letterSpacing: "0.04em" }}>Logs</span>
          {!!log?.length && (
            <span style={{ fontSize: 10, fontWeight: 700, background: `${GOLD}22`, borderRadius: 100, padding: "1px 6px" }}>
              {log.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 60, width: 320, maxHeight: 360, overflowY: "auto",
                padding: "16px", borderRadius: 14, textAlign: "left",
                background: "rgba(10,11,16,0.98)", border: `1px solid ${GOLD}44`,
                backdropFilter: "blur(14px)", boxShadow: `0 14px 48px -14px ${GOLD}55`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: GOLD, fontSize: 12 }}>✦</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>
                  The Historian&apos;s Log
                </span>
              </div>
              {!log?.length ? (
                <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, fontStyle: "italic" }}>
                  The record is empty. Your journey has not yet been observed.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...log].reverse().map((entry, i) => (
                    <div key={entry.ts + "-" + i} style={{ display: "flex", gap: 10 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: `${GOLD}88`, marginTop: 7, flexShrink: 0 }} />
                      <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: "var(--text2)" }}>
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
