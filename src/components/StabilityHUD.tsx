"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTier } from "@/lib/stability";

const GOLD = "#e8c97e";

function downloadArchive(log: { text: string; ts: number }[]) {
  const lines = [...log].map((e, i) => {
    const ts = new Date(e.ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    return `[${String(i + 1).padStart(3, "0")}] ${ts}\n      ${e.text}`;
  });
  const content = [
    "╔══════════════════════════════════════════╗",
    "║       THE MULTIVERSAL HISTORIAN'S LOG    ║",
    "╚══════════════════════════════════════════╝",
    `Exported: ${new Date().toLocaleString()}`,
    `Entries:  ${log.length}`,
    "",
    "─".repeat(50),
    "",
    ...lines.flatMap(l => [l, ""]),
    "─".repeat(50),
    "End of Archive",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historian-archive-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function StabilityHUD({ stability, log, stabilityLog }: {
  stability: number;
  log?: { text: string; ts: number }[];
  stabilityLog?: { value: number; delta: number; message: string; ts: number }[];
}) {
  const tier = getTier(stability);
  const critical = tier.status === "critical" || tier.status === "collapse";
  const harmonized = tier.status === "harmonized";
  const [hover, setHover] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showStab, setShowStab] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const stabRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside / Escape
  useEffect(() => {
    if (!showLog && !showStab) return;
    const onClick = (e: MouseEvent) => {
      if (showLog && logRef.current && !logRef.current.contains(e.target as Node)) setShowLog(false);
      if (showStab && stabRef.current && !stabRef.current.contains(e.target as Node)) setShowStab(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setShowLog(false); setShowStab(false); } };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [showLog, showStab]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

      {/* ── Timeline stability pill (click for log) ── */}
      <div ref={stabRef} style={{ position: "relative" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div onClick={() => { setShowStab(v => !v); setShowLog(false); }} style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          padding: "6px 12px", borderRadius: 100,
          background: showStab ? `${tier.color}14` : "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}${showStab ? "66" : "33"}`,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: tier.color, flexShrink: 0,
            boxShadow: `0 0 8px ${tier.color}`,
            animation: (critical || harmonized) ? "pulse-glow 1.2s infinite" : "none",
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
          {hover && !showStab && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              onClick={() => { setShowStab(v => !v); setShowLog(false); }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 60, width: 264,
                padding: "18px 18px 14px", borderRadius: 16, cursor: "pointer",
                background: "rgba(14,16,24,0.97)", border: `1px solid ${tier.color}33`,
                backdropFilter: "blur(12px)", boxShadow: `0 16px 48px -16px ${tier.color}55`,
              }}
            >
              {/* Big number + label */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: tier.color, letterSpacing: "-1px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {stability}<span style={{ fontSize: 16 }}>%</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: tier.color, opacity: 0.85 }}>{tier.label}</span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6, marginBottom: 14 }}>{tier.effect}</p>
              <div style={{ paddingTop: 10, borderTop: `1px solid ${tier.color}1a`, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke={tier.color} strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.02em" }}>Click to view stability log</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Stability log popover */}
        <AnimatePresence>
          {showStab && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", top: "calc(100% + 12px)", right: 0, zIndex: 200, width: 380,
                background: "rgba(8,9,13,0.97)", border: `1px solid ${tier.color}44`, borderRadius: 16,
                backdropFilter: "blur(20px)", boxShadow: `0 24px 64px -16px rgba(0,0,0,0.8), inset 0 1px 0 ${tier.color}22`, overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px 12px",
                borderBottom: `1px solid ${tier.color}22`, background: `${tier.color}08` }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: tier.color, fontFamily: "Sora, sans-serif" }}>
                  Timeline Stability Log
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: tier.color }}>{stability}%</span>
              </div>
              <div className="historian-log-scroll" style={{ maxHeight: 360, overflowY: "auto", padding: "14px 18px 18px" }}>
                {!stabilityLog?.length ? (
                  <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 14, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>
                    No shifts yet. The timeline holds steady.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...stabilityLog].reverse().map((e, i) => {
                      const up = e.delta > 0;
                      const c = up ? "#4ecdc4" : "#f07070";
                      return (
                        <div key={e.ts + "-" + i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ flexShrink: 0, minWidth: 46, textAlign: "center", fontSize: 12, fontWeight: 700, color: c,
                            background: `${c}15`, border: `1px solid ${c}33`, borderRadius: 7, padding: "3px 4px", fontVariantNumeric: "tabular-nums" }}>
                            {up ? "▲ +" : "▼ "}{Math.abs(e.delta)}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, margin: 0 }}>{e.message}</p>
                            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "Sora, sans-serif" }}>
                              → {e.value}% · {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {!!log?.length && (
                    <button
                      onClick={() => downloadArchive(log)}
                      aria-label="Download archive"
                      title="Download archive"
                      style={{
                        background: `${GOLD}12`, border: `1px solid ${GOLD}33`, cursor: "pointer",
                        color: `${GOLD}99`, padding: "4px 10px", borderRadius: 6,
                        display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "Sora, sans-serif", fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.background = `${GOLD}22`; e.currentTarget.style.borderColor = `${GOLD}66`; }}
                      onMouseLeave={e => { e.currentTarget.style.color = `${GOLD}99`; e.currentTarget.style.background = `${GOLD}12`; e.currentTarget.style.borderColor = `${GOLD}33`; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v13M7 12l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Download
                    </button>
                  )}
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

/** Full-width banner shown at unstable, critical, and collapse stability — or harmonized (special positive). */
export function TimelineWarningBanner({ stability }: { stability: number }) {
  const tier = getTier(stability);
  if (tier.status === "stable") return null;

  const isCollapse = tier.status === "collapse";
  const isHarmonized = tier.status === "harmonized";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 45,
        background: isCollapse
          ? "rgba(240,112,112,0.08)"
          : isHarmonized
          ? "rgba(126,232,225,0.08)"
          : `${tier.color}0d`,
        borderBottom: `1px solid ${tier.color}${isCollapse ? "55" : "35"}`,
        backdropFilter: "blur(10px)", padding: "8px 40px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}
    >
      {isCollapse ? (
        <>
          <span style={{
            color: tier.color, fontSize: 13, fontWeight: 600,
            animation: "glitch-flicker 1.5s infinite",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>
            {tier.label}
          </span>
          <span style={{ color: "var(--text3)", fontSize: 12 }}>New paths emerge from the wreckage — keep exploring.</span>
        </>
      ) : isHarmonized ? (
        <>
          <span style={{
            color: tier.color, fontSize: 13, fontWeight: 600,
            animation: "pulse-glow 2s infinite",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {tier.label}
          </span>
          <span style={{ color: "var(--text3)", fontSize: 12 }}>{tier.effect}</span>
        </>
      ) : (
        <>
          <span style={{ color: tier.color, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>
            {tier.label}
          </span>
          <span style={{ color: "var(--text3)", fontSize: 12 }}>{tier.effect}</span>
        </>
      )}
    </motion.div>
  );
}
