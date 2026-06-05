"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Dna, Globe2, Radio, ScrollText, Crown, Sparkles, Scale, BookOpen,
  FileText, Boxes, BookMarked, type LucideIcon,
} from "lucide-react";
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

        {/* ── HOW IT WORKS ── */}
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 40px 40px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--violet2)", marginBottom: 12 }}>
              How it works
            </p>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)" }}>
              Three steps to your multiverse
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, position: "relative" }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                style={{ position: "relative", padding: "28px 24px", borderRadius: 18, textAlign: "center",
                  background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ position: "absolute", top: 16, right: 18, fontSize: 40, fontWeight: 800, letterSpacing: "-2px",
                  color: "var(--surface3)", lineHeight: 1 }}>{i + 1}</div>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                  background: "linear-gradient(135deg, rgba(124,110,247,0.25), rgba(124,110,247,0.08))",
                  border: "1px solid rgba(124,110,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <s.icon size={24} color="var(--violet2)" strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "60px 40px 40px" }}>
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
                whileHover={{ y: -5 }}
                style={{
                  position: "relative", overflow: "hidden",
                  background: "linear-gradient(160deg, var(--surface), var(--bg2))",
                  border: "1px solid var(--border)",
                  borderRadius: 18, padding: 26, textAlign: "left", transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${f.color}55`; el.style.boxShadow = `0 14px 40px -16px ${f.color}55`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "none"; }}
              >
                {/* corner glow */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.color}22, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{
                  width: 48, height: 48, borderRadius: 13, marginBottom: 18, position: "relative",
                  background: `linear-gradient(135deg, ${f.color}40, ${f.color}15)`, border: `1px solid ${f.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 16px -4px ${f.color}40`,
                }}>
                  <f.icon size={22} color={f.color} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.3px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CLOSING CTA ── */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 80px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              position: "relative", overflow: "hidden", textAlign: "center",
              padding: "56px 40px", borderRadius: 28,
              background: "linear-gradient(135deg, rgba(124,110,247,0.12), rgba(78,205,196,0.08))",
              border: "1px solid rgba(124,110,247,0.25)",
            }}
          >
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 400, height: 200,
              borderRadius: "50%", background: "radial-gradient(circle, rgba(124,110,247,0.25), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
            <h2 style={{ position: "relative", fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 12 }}>
              Who could you have become?
            </h2>
            <p style={{ position: "relative", fontSize: 15, color: "var(--text2)", marginBottom: 28, fontWeight: 300 }}>
              Paste your résumé. Meet six versions of yourself. Choose your story.
            </p>
            <button
              onClick={() => transitionTo("upload-resume")}
              style={{
                position: "relative",
                padding: "16px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
                background: "var(--violet)", border: "1px solid var(--violet2)", color: "#fff",
                boxShadow: "0 0 40px rgba(124,110,247,0.4)", transition: "all 0.25s",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--violet2)"; b.style.transform = "translateY(-2px)"; b.style.boxShadow = "0 0 60px rgba(124,110,247,0.6)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--violet)"; b.style.transform = "translateY(0)"; b.style.boxShadow = "0 0 40px rgba(124,110,247,0.4)"; }}
            >
              Generate My Alternate Lives →
            </button>
          </motion.div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>
              Linked<span style={{ color: "var(--violet2)" }}>Out</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
              You&apos;ve been linked out of the timeline you know.<br />Meet the people you could have become.
            </p>
            <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 16, opacity: 0.6 }}>
              Powered by AI agents · A narrative career multiverse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: FileText, title: "Paste your résumé", desc: "Drop in your career history. An AI agent reads between the lines to find who you really are." },
  { icon: Boxes, title: "Explore your selves", desc: "Six alternate-universe versions of you come to life — each with their own story, voice, and fate." },
  { icon: BookMarked, title: "Choose your story", desc: "Talk to them, weigh their lives, and decide which future you're willing to become." },
];

const FEATURES: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  { icon: Dna, color: "#7c6ef7", title: "Career DNA Analysis", desc: "An AI agent decodes the identity hidden in your résumé — your skills, drives, and the thread running through every role." },
  { icon: Globe2, color: "#4ecdc4", title: "Six Alternate Universes", desc: "Become a knight, a netrunner, a corsair, a dragon-keeper, a starfarer, or an immortal. Same you — a different world." },
  { icon: Radio, color: "#9d91ff", title: "Talk to Your Future Self", desc: "Hold a real conversation with the person you became — who remembers your life and speaks from decades ahead." },
  { icon: ScrollText, color: "#e8c97e", title: "Multiverse Recruiters", desc: "Receive offers from royal courts, megacorps, and ancient orders. Accept, negotiate, or walk away." },
  { icon: Crown, color: "#f5dfa0", title: "Legendary & Shadow Selves", desc: "Meet your greatest possible self — and the cautionary one who let ambition outrun their values." },
  { icon: Sparkles, color: "#7ee8e1", title: "Butterfly Effect", desc: "Change one decision and watch your life fracture across four wildly different timelines." },
  { icon: Scale, color: "#ff9595", title: "Council of Selves", desc: "Every version of you gathers to debate — then asks the question you've been avoiding." },
  { icon: BookOpen, color: "#ffc278", title: "Your Chronicle", desc: "Your entire journey becomes a personalized novella about the life you chose to become." },
];
