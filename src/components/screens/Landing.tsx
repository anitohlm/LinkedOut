"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { getAllUniverses } from "@/lib/universes";

interface LandingProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

export default function Landing({ transitionTo }: LandingProps) {
  const universes = getAllUniverses();
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2 + 1;
      Object.assign(star.style, {
        position: "absolute",
        borderRadius: "50%",
        background: "#fff",
        width: `${size}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: String(Math.random() * 0.6 + 0.1),
        animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 4}s`,
      });
      container.appendChild(star);
    }
    return () => { container.innerHTML = ""; };
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden", background: "var(--grad1)", position: "relative" }}>
      {/* Stars layer */}
      <div ref={starsRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Nebula blobs */}
      <div style={{
        position: "fixed", width: 400, height: 300, top: -100, right: -100,
        background: "rgba(124,110,247,0.2)", filter: "blur(80px)", borderRadius: "50%",
        pointerEvents: "none", zIndex: 0, animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", width: 300, height: 400, bottom: -100, left: -50,
        background: "rgba(78,205,196,0.12)", filter: "blur(80px)", borderRadius: "50%",
        pointerEvents: "none", zIndex: 0, animation: "float 8s ease-in-out infinite",
        animationDelay: "-4s",
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", cursor: "pointer", color: "var(--text)" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s",
            background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)",
          }}>
            View Universes
          </button>
          <button
            onClick={() => transitionTo("upload-resume")}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s",
              background: "var(--violet)", border: "1px solid var(--violet2)", color: "#fff",
            }}
          >
            Upload Resume
          </button>
        </div>
      </nav>

      {/* ── HERO CONTENT ── */}
      <div style={{ position: "relative", zIndex: 10, paddingTop: 164, paddingBottom: 60 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: 800, margin: "0 auto", padding: "0 40px", textAlign: "center" }}
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px",
              background: "rgba(124,110,247,0.15)",
              border: "1px solid rgba(124,110,247,0.3)",
              borderRadius: 100,
              fontSize: 12, color: "var(--violet2)",
              letterSpacing: "0.05em", textTransform: "uppercase",
              marginBottom: 32,
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: "var(--violet2)", animation: "pulse-glow 1.5s infinite",
              }} />
              AI Career Multiverse Platform
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={item} style={{
            fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 700,
            lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24,
          }}>
            Your Career,<br />
            <span style={{
              background: "linear-gradient(90deg, var(--violet2), var(--cyan2), var(--gold2))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Reimagined Across<br />Infinite Universes.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={item} style={{
            fontSize: 18, color: "var(--text2)", lineHeight: 1.7,
            maxWidth: 560, margin: "0 auto 48px", fontWeight: 300,
          }}>
            Upload your resume and discover who you could have become in another reality.
            Powered by AI. Inspired by you.
          </motion.p>

          {/* CTA group */}
          <motion.div variants={item} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
            <button
              onClick={() => transitionTo("upload-resume")}
              style={{
                padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
                background: "var(--violet)", border: "1px solid var(--violet2)", color: "#fff",
                boxShadow: "0 0 40px rgba(124,110,247,0.3)", transition: "all 0.25s",
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet2)";
                b.style.transform = "translateY(-2px)";
                b.style.boxShadow = "0 0 60px rgba(124,110,247,0.5)";
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet)";
                b.style.transform = "translateY(0)";
                b.style.boxShadow = "0 0 40px rgba(124,110,247,0.3)";
              }}
            >
              Generate My Alternate Career
            </button>
            <button style={{
              padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
              background: "transparent", border: "1px solid var(--border2)", color: "var(--text)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "var(--border3)";
                b.style.background = "var(--surface)";
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "var(--border2)";
                b.style.background = "transparent";
              }}
            >
              View Sample Universes
            </button>
          </motion.div>

          {/* Universe cards grid — 2 rows × 3 columns */}
          <motion.div variants={item} style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            maxWidth: 560,
            margin: "0 auto",
            paddingBottom: 80,
          }}>
            {universes.map((universe, i) => (
              <div
                key={universe.id}
                onClick={() => transitionTo("upload-resume")}
                style={{
                  padding: "20px 24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s",
                  animation: `float 6s ease-in-out infinite`,
                  animationDelay: `${-i}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border3)";
                  el.style.background = "var(--surface2)";
                  el.style.transform = "translateY(-4px) scale(1.02)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border)";
                  el.style.background = "var(--surface)";
                  el.style.transform = "translateY(0) scale(1)";
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{universe.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>{universe.title}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
