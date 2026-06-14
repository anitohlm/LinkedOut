"use client";

import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const GOLD = "#e8c97e";
const BLUE = "#6c8cff";

function fmt(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

export default function HistorianLog({ state, transitionTo }: Props) {
  const log = [...(state.historianLog || [])].reverse();

  return (
    <div style={{ minHeight: "100vh", background: "#06070f", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "url('/universe-art/historian-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(6,7,12,0.42) 0%, rgba(6,7,12,0.58) 50%, rgba(6,7,12,0.82) 100%)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/logo.png" alt="LinkedOut" style={{ height: 26, width: "auto", display: "block" }} />
        </button>
        <button onClick={() => transitionTo("chronicle")}
          style={{ background: "none", border: `1px solid ${GOLD}55`, color: GOLD, cursor: "pointer", fontSize: 12, fontWeight: 600,
            padding: "7px 14px", borderRadius: 8, fontFamily: "Sora, sans-serif" }}>Open Chronicle →</button>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 40px 100px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/universe-icons/historian.png" alt="" width={72} height={72}
            style={{ objectFit: "contain", margin: "0 auto 16px", display: "block", filter: `drop-shadow(0 0 16px ${GOLD}66)` }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: BLUE, marginBottom: 12 }}>
            Keeper of Record
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 600, letterSpacing: "0.05em", color: "#fff", margin: "0 0 14px" }}>
            The Historian&apos;s Log
          </h1>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            &ldquo;I record what you become. Every choice across the multiverse is written here — in time, it becomes legend.&rdquo;
          </p>
        </motion.div>

        {/* Log */}
        {log.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ textAlign: "center", padding: "60px 24px", borderRadius: 18,
              background: "linear-gradient(160deg, rgba(17,19,30,0.7), rgba(9,11,19,0.85))", border: `1px solid ${BLUE}22` }}>
            <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>
              The Historian has not yet put quill to parchment.<br />
              Explore your multiverse — your story will be written here.
            </p>
          </motion.div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Timeline spine */}
            <div aria-hidden style={{ position: "absolute", left: 13, top: 6, bottom: 6, width: 2,
              background: `linear-gradient(180deg, ${GOLD}, ${BLUE}55, transparent)`, opacity: 0.5 }} />

            {log.map((entry, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.5) }}
                style={{ position: "relative", paddingLeft: 44, marginBottom: 22 }}>
                {/* Node */}
                <div style={{ position: "absolute", left: 7, top: 4, width: 14, height: 14, borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${GOLD}, ${GOLD}44)`, border: `1px solid ${GOLD}`, boxShadow: `0 0 12px ${GOLD}66` }} />
                {/* Entry card */}
                <div style={{ borderRadius: 14, padding: "16px 20px",
                  background: "linear-gradient(160deg, rgba(17,19,30,0.78), rgba(9,11,19,0.9))",
                  border: `1px solid ${GOLD}1f`, boxShadow: `0 12px 36px -22px ${GOLD}44` }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE, marginBottom: 6 }}>
                    {fmt(entry.ts)}
                  </div>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, lineHeight: 1.7, color: "var(--text)", margin: 0 }}>
                    {entry.text}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Closing flourish */}
            <div style={{ position: "relative", paddingLeft: 44, marginTop: 8 }}>
              <div style={{ position: "absolute", left: 9, top: 2, width: 10, height: 10, borderRadius: "50%", background: BLUE, opacity: 0.5 }} />
              <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 13, color: "var(--text3)" }}>
                The record continues with every choice you make…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
