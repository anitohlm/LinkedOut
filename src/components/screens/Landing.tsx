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
            Paste your resume and discover who you could have become in another reality.
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
              Generate My Alternate Lives
            </button>
          </motion.div>

          {/* Universe cards grid — 2 rows × 3 columns */}
          <motion.div variants={item} style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            maxWidth: 900,
            margin: "0 auto",
            paddingBottom: 80,
          }}>
            {universes.map((universe, i) => (
              <div
                key={universe.id}
                onClick={() => transitionTo("upload-resume")}
                style={{
                  padding: "24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  cursor: "pointer",
                  textAlign: "left",
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
                <div style={{ fontSize: 28, marginBottom: 10 }}>{universe.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{universe.title}</div>
                <div style={{ fontSize: 12, fontWeight: 400, color: "var(--text3)", lineHeight: 1.5 }}>{universe.lore}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── FEATURES ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 40px 100px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--violet2)", marginBottom: 12 }}>
              An entire multiverse, powered by AI agents
            </p>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)" }}>
              More than a résumé. A story of every life you could live.
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 18, padding: 26, textAlign: "left", transition: "border-color 0.3s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}55`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, marginBottom: 16,
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.3px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Closing CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginTop: 64 }}
          >
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: 20 }}>
              Who could you have become?
            </h2>
            <button
              onClick={() => transitionTo("upload-resume")}
              style={{
                padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
                background: "var(--violet)", border: "1px solid var(--violet2)", color: "#fff",
                boxShadow: "0 0 40px rgba(124,110,247,0.3)", transition: "all 0.25s",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--violet2)"; b.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--violet)"; b.style.transform = "translateY(0)"; }}
            >
              Generate My Alternate Lives
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "🧬", color: "#7c6ef7", title: "Career DNA Analysis", desc: "An AI agent decodes the identity hidden in your résumé — your skills, drives, and the thread running through every role." },
  { icon: "🌌", color: "#4ecdc4", title: "Six Alternate Universes", desc: "Become a knight, a netrunner, a corsair, a dragon-keeper, a starfarer, or an immortal. Same you — a different world." },
  { icon: "📡", color: "#9d91ff", title: "Talk to Your Future Self", desc: "Hold a real conversation with the person you became — who remembers your life and speaks from decades ahead." },
  { icon: "📜", color: "#e8c97e", title: "Multiverse Recruiters", desc: "Receive offers from royal courts, megacorps, and ancient orders. Accept, negotiate, or walk away." },
  { icon: "👑", color: "#f5dfa0", title: "Legendary & Shadow Selves", desc: "Meet your greatest possible self — and the cautionary one who let ambition outrun their values." },
  { icon: "🦋", color: "#7ee8e1", title: "Butterfly Effect", desc: "Change one decision and watch your life fracture across four wildly different timelines." },
  { icon: "⚖️", color: "#ff9595", title: "Council of Selves", desc: "Every version of you gathers to debate — then asks the question you've been avoiding." },
  { icon: "📖", color: "#ffc278", title: "Your Chronicle", desc: "Your entire journey becomes a personalized novella about the life you chose to become." },
];
