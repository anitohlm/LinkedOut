"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTier } from "@/lib/stability";

const GOLD = "#e8c97e";

export function StabilityHUD({ stability, log }: { stability: number; log?: { text: string; ts: number }[] }) {
  const tier = getTier(stability);
  const critical = tier.status === "critical" || tier.status === "collapse";
  const [hover, setHover] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!showLog) return;
    const handler = (e: MouseEvent) => {
      if (logRef.current && !logRef.current.contains(e.target as Node)) {
        setShowLog(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLog]);

  // Close on Escape
  useEffect(() => {
    if (!showLog) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowLog(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showLog]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

      {/* ── Timeline stability pill ── */}
      <div style={{ position: "relative" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "default",
          padding: "6px 12px", borderRadius: 100,
          background: "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}33`,
        }}>
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

        {/* Hover tooltip */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 60, width: 240,
                padding: "14px 16px", borderRadius: 14,
                background: "rgba(14,16,24,0.97)", border: `1px solid ${tier.color}44`,
                backdropFilter: "blur(12px)", boxShadow: `0 12px 40px -12px ${tier.color}55`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>{stability}%</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.55 }}>{tier.effect}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Historian Logs ── */}
      <div ref={logRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowLog(v => !v)}
          aria-label="Toggle Historian's Log"
          aria-expanded={showLog}
          style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            padding: "6px 12px", borderRadius: 100, fontFamily: "Sora, sans-serif", fontSize: 12,
            background: showLog ? `${GOLD}18` : "rgba(255,255,255,0.03)",
            border: `1px solid ${GOLD}${showLog ? "66" : "33"}`, color: GOLD,
            transition: "all 0.2s",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5" fill={GOLD} />
          </svg>
          <span style={{ letterSpacing: "0.04em" }}>Logs</span>
          {!!log?.length && (
            <span style={{
              fontSize: 10, fontWeight: 700, background: `${GOLD}22`,
              borderRadius: 100, padding: "1px 7px", color: GOLD,
            }}>
              {log.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", top: "calc(100% + 12px)", right: 0, zIndex: 200,
                width: 546,
                background: "rgba(8,9,13,0.97)",
                border: `1px solid ${GOLD}33`,
                borderRadius: 16,
                backdropFilter: "blur(20px)",
                boxShadow: `0 24px 64px -16px rgba(0,0,0,0.8), 0 0 0 1px ${GOLD}18, inset 0 1px 0 ${GOLD}22`,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px 12px",
                borderBottom: `1px solid ${GOLD}22`,
                background: `${GOLD}08`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5" fill={GOLD} />
                  </svg>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: GOLD, fontFamily: "Sora, sans-serif",
                  }}>
                    The Historian&apos;s Log
                  </span>
                  {!!log?.length && (
                    <span style={{ fontSize: 10, color: `${GOLD}99`, fontFamily: "Sora, sans-serif" }}>
                      {log.length} {log.length === 1 ? "entry" : "entries"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowLog(false)}
                  aria-label="Close log"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: `${GOLD}66`, padding: 4, borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = `${GOLD}66`)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Log entries */}
              <div
                className="historian-log-scroll"
                style={{ maxHeight: 624, overflowY: "auto", padding: "16px 20px 20px" }}
              >
                {!log?.length ? (
                  <p style={{
                    fontFamily: "Crimson Pro, serif", fontStyle: "italic",
                    fontSize: 14, lineHeight: 1.65, color: "var(--text3)", textAlign: "center",
                    padding: "16px 0",
                  }}>
                    The record is empty.<br />Your journey has not yet been observed.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[...log].reverse().map((entry, i) => (
                      <motion.div
                        key={entry.ts + "-" + i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                      >
                        {/* Bullet */}
                        <div style={{ paddingTop: 7, flexShrink: 0 }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: i === 0 ? GOLD : `${GOLD}55`,
                            boxShadow: i === 0 ? `0 0 6px ${GOLD}` : "none",
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontFamily: "Crimson Pro, serif", fontStyle: "italic",
                            fontSize: 19, lineHeight: 1.7, color: i === 0 ? "var(--text)" : "var(--text2)",
                            margin: 0,
                          }}>
                            {entry.text}
                          </p>
                          <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "Sora, sans-serif", marginTop: 2, display: "block" }}>
                            {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fade bottom gradient */}
              {(log?.length ?? 0) > 4 && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 40, pointerEvents: "none",
                  background: "linear-gradient(to bottom, transparent, rgba(8,9,13,0.97))",
                  borderRadius: "0 0 16px 16px",
                }} />
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
      <span style={{
        color: tier.color, fontSize: 13, fontWeight: 600,
        animation: tier.status === "collapse" ? "glitch-flicker 1.5s infinite" : "none",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }}><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>{tier.label}
      </span>
      <span style={{ color: "var(--text3)", fontSize: 12 }}>{tier.effect}</span>
    </motion.div>
  );
}
