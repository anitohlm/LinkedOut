"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import {
  FileText, Globe2, Radio, AlertTriangle, Eye, Scale, BookOpen, type LucideIcon,
} from "lucide-react";
import { AppState, AppScreenState } from "@/types";
import { UNIVERSES } from "@/lib/universes";

const AuroraStars = dynamic(
  () => import("@/components/ui/aurora-stars").then(m => m.AuroraStars),
  { ssr: false }
);

const AURORA_COLORS = ["#7c6ef7", "#4ecdc4", "#e8c97e", "#9d4edd"];

interface LandingProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
  savedExists?: boolean;
  onResume?: () => void;
  onNewGame?: () => void;
  savedScreen?: AppScreenState;
}

const SCREEN_LABELS: Partial<Record<AppScreenState, string>> = {
  "universe-discovery": "exploring your multiverse",
  "identity-reconstruction": "viewing a universe self",
  "future-transmission": "mid-conversation with a future self",
  "multiverse-invitations": "reviewing recruiter offers",
  "butterfly-effect": "fracturing your timeline",
  "council-of-selves": "at the Council of Selves",
  "chronicle": "reading your chronicle",
};

export default function Landing({ transitionTo, savedExists, onResume, onNewGame, savedScreen }: LandingProps) {
  const color = useMotionValue(AURORA_COLORS[0]);
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  useEffect(() => {
    animate(color, AURORA_COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div style={{ minHeight: "100vh", overflow: "hidden", backgroundImage, position: "relative" }}>
      {/* Three.js Stars — full-screen fixed background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <AuroraStars />
      </div>

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
          </motion.p>

          {/* Resume saved journey */}
          {savedExists && (
            <motion.div variants={item} style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderRadius: 14,
                background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.3)", maxWidth: 520,
              }}>
                <div style={{ fontSize: 24 }}>💾</div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cyan2)" }}>Continue your journey</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>
                    You left off {savedScreen && SCREEN_LABELS[savedScreen] ? SCREEN_LABELS[savedScreen] : "in your multiverse"}.
                  </div>
                </div>
                <button
                  onClick={() => onResume?.()}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "var(--cyan)", color: "#0a0a0a", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                  Resume →
                </button>
              </div>
            </motion.div>
          )}

          {/* CTA group */}
          <motion.div variants={item} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
            <motion.button
              onClick={() => { onNewGame?.(); transitionTo("upload-resume"); }}
              style={{
                padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
                background: "var(--violet)", border, color: "#fff", boxShadow,
                transition: "background 0.25s, transform 0.25s",
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Generate My Alternate Lives
            </motion.button>
          </motion.div>

        </motion.div>

        {/* ── ALTERNATE UNIVERSES — cinematic horizontal carousel ── */}
        <UniverseCarousel />

        {/* ── THE JOURNEY (cinematic vertical timeline) ── */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 40px" }}>
          {/* Section heading */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 72, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--violet2)", marginBottom: 16 }}>
              A message from your future
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.15, color: "var(--text)", marginBottom: 18 }}>
              Your résumé was only the beginning.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.7, fontWeight: 300 }}>
              Every choice creates a different future. LinkedOut reveals the lives you could have lived — and lets you talk to the person you became.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="lo-journey" style={{ position: "relative" }}>
            {/* glowing connecting line */}
            <div aria-hidden className="lo-journey-line" style={{
              position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, transform: "translateX(-50%)",
              background: "linear-gradient(180deg, transparent, var(--violet2) 8%, var(--cyan2) 50%, var(--gold2) 92%, transparent)",
              boxShadow: "0 0 16px rgba(124,110,247,0.4)", opacity: 0.5,
            }} />

            {JOURNEY.map((step, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={step.title}
                  className="lo-journey-row"
                  initial={{ opacity: 0, x: left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  {/* Card (left side) */}
                  <div className="lo-journey-left" style={{ gridColumn: 1, display: "flex", justifyContent: "flex-end" }}>
                    {left && <JourneyCard step={step} index={i} align="right" />}
                  </div>

                  {/* Node */}
                  <div className="lo-journey-node" style={{ gridColumn: 2, display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
                    <motion.div
                      whileInView={{ scale: [0.6, 1.15, 1] }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                      style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${step.color}, ${step.color}33)`,
                        border: `1px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 24px ${step.color}66`,
                      }}>
                      <step.icon size={24} color="#0a0a0a" strokeWidth={2} />
                    </motion.div>
                  </div>

                  {/* Card (right side) */}
                  <div className="lo-journey-right" style={{ gridColumn: 3, display: "flex", justifyContent: "flex-start" }}>
                    {!left && <JourneyCard step={step} index={i} align="left" />}
                  </div>
                </motion.div>
              );
            })}
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
            <motion.button
              onClick={() => transitionTo("upload-resume")}
              style={{
                position: "relative",
                padding: "16px 36px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "Sora, sans-serif", letterSpacing: "-0.2px",
                background: "var(--violet)", border, color: "#fff", boxShadow,
                transition: "background 0.25s",
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Generate My Alternate Lives →
            </motion.button>
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
    </motion.div>
  );
}

/* ── Cinematic Universe Carousel ── */
interface World {
  id: string;
  color: string;
  accentColor: string;
  name: string;
  era: string;
  teaser: string;
  transmission: string;
  artKind: "space" | "neon" | "ocean" | "dragon" | "medieval" | "night";
  floatDelay: number;
}

const WORLDS: World[] = [
  {
    id: "galactic",
    color: "#00D9FF",
    accentColor: "#7c6ef7",
    name: UNIVERSES.galactic.title,
    era: "Year 3050 · Deep Space",
    teaser: "Humanity's second home lies past the last mapped star. The frontier doesn't forgive hesitation — or second thoughts.",
    transmission: "3 transmissions intercepted · Signal origin: unknown",
    artKind: "space",
    floatDelay: 0,
  },
  {
    id: "cyberpunk",
    color: "#00FF88",
    accentColor: "#4ecdc4",
    name: "Neon Synthesis",
    era: "Year 2157 · Neon City",
    teaser: "When the city never sleeps and consciousness uploads at midnight, power lives in the grid. Not on the streets.",
    transmission: "7 transmissions intercepted · Source: encrypted relay",
    artKind: "neon",
    floatDelay: -1.2,
  },
  {
    id: "pirate",
    color: "#FF6B35",
    accentColor: "#f07070",
    name: "Endless Seas",
    era: "Year 1718 · The Free Waters",
    teaser: "Three oceans, a hundred warring ports, and no empire bold enough to claim the sea belongs to them.",
    transmission: "2 transmissions intercepted · Delivered by storm crow",
    artKind: "ocean",
    floatDelay: -0.6,
  },
  {
    id: "dragon",
    color: "#9D4EDD",
    accentColor: "#f0a050",
    name: "Ancient Draconia",
    era: "Age of the Fifth Sun",
    teaser: "The eldest among them remember the time before kingdoms. They do not negotiate. They only remember.",
    transmission: "1 transmission intercepted · Spoken in flame",
    artKind: "dragon",
    floatDelay: -2.1,
  },
  {
    id: "medieval",
    color: "#D4AF37",
    accentColor: "#e8c97e",
    name: "Medieval Kingdom",
    era: "Year 1471 · The Realm",
    teaser: "Behind the walls of every great castle is a war no one speaks of. The battles worth winning happen in candlelit rooms.",
    transmission: "4 transmissions intercepted · Sealed with wax",
    artKind: "medieval",
    floatDelay: -1.8,
  },
  {
    id: "vampire",
    color: "#E31937",
    accentColor: "#e879a0",
    name: "Eternal Night",
    era: "Year 1888 · The City Below",
    teaser: "The city beneath the city has existed since before your history books began. They have been watching since then.",
    transmission: "5 transmissions intercepted · Delivered at dusk",
    artKind: "night",
    floatDelay: -0.9,
  },
];

/* Per-world cinematic art panels */
function WorldArt({ kind, color, accentColor }: { kind: World["artKind"]; color: string; accentColor: string }) {
  const base: React.CSSProperties = {
    position: "absolute", inset: 0, overflow: "hidden", borderRadius: "20px 20px 0 0",
  };

  if (kind === "space") return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 60%, ${accentColor}55 0%, transparent 60%), radial-gradient(ellipse at 75% 20%, ${color}33 0%, transparent 50%), #020617` }} />
      {/* planet */}
      <div style={{ position: "absolute", bottom: 20, left: 30, width: 90, height: 90, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${accentColor}44)`,
        boxShadow: `0 0 40px ${color}66`, opacity: 0.9 }} />
      {/* ring */}
      <div style={{ position: "absolute", bottom: 52, left: 5, width: 140, height: 24, borderRadius: "50%",
        border: `2px solid ${color}55`, transform: "rotate(-12deg)", opacity: 0.6 }} />
      {/* stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          style={{ position: "absolute", width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
            borderRadius: "50%", background: "#fff",
            top: `${5 + (i * 17) % 80}%`, left: `${(i * 23 + 7) % 95}%` }} />
      ))}
      {/* nebula streaks */}
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 10, right: -10, width: 120, height: 200,
          background: `linear-gradient(135deg, ${accentColor}44, transparent)`, filter: "blur(24px)", borderRadius: "50%" }} />
    </div>
  );

  if (kind === "neon") return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: "#020617" }} />
      {/* grid floor */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
        backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
      {/* neon building silhouettes */}
      {[60, 30, 80, 45, 70].map((h, i) => (
        <div key={i} style={{ position: "absolute", bottom: 0, left: `${10 + i * 18}%`, width: "14%", height: `${h}%`,
          background: `linear-gradient(to top, ${color}22, transparent)`,
          borderTop: `2px solid ${color}66`, borderLeft: `1px solid ${color}33`, borderRight: `1px solid ${color}33` }} />
      ))}
      {/* vertical neon lines */}
      {[0.2, 0.5, 0.8].map((x, i) => (
        <motion.div key={i} animate={{ opacity: [0, 0.9, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
          style={{ position: "absolute", top: 0, bottom: 0, left: `${x * 100}%`, width: 1, background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
      ))}
      {/* glow orb */}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}88, transparent 70%)`, filter: "blur(16px)" }} />
      {/* rain */}
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} animate={{ y: [-10, 200], opacity: [0, 0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          style={{ position: "absolute", top: 0, left: `${(i * 29 + 3) % 95}%`, width: 1, height: 12,
            background: `linear-gradient(to bottom, transparent, ${color}88)` }} />
      ))}
    </div>
  );

  if (kind === "ocean") return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0a1628 0%, #1a3a5c 50%, ${color}33 100%)` }} />
      {/* sun/moon on horizon */}
      <div style={{ position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)", width: 44, height: 44, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}ff, ${color}88)`, boxShadow: `0 0 60px ${color}99` }} />
      {/* horizon glow */}
      <div style={{ position: "absolute", top: "40%", left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }} />
      {/* waves */}
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i} animate={{ x: [0, i % 2 === 0 ? 20 : -20, 0] }} transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          style={{ position: "absolute", bottom: `${i * 16}%`, left: -20, right: -20, height: 24,
            borderRadius: "50%", border: `1px solid ${color}${44 + i * 16}`, opacity: 0.5 + i * 0.1 }} />
      ))}
      {/* ship silhouette */}
      <div style={{ position: "absolute", bottom: "32%", left: "50%", transform: "translateX(-50%)", opacity: 0.7 }}>
        <div style={{ width: 70, height: 18, background: `${color}99`, borderRadius: "0 0 6px 6px", position: "relative" }}>
          <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 2, height: 30, background: `${color}cc` }} />
          <div style={{ position: "absolute", top: -22, left: "calc(50% + 2px)", width: 28, height: 20,
            background: `${color}55`, clipPath: "polygon(0 100%, 100% 50%, 0 0)" }} />
        </div>
      </div>
    </div>
  );

  if (kind === "dragon") return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0d0718 0%, #1a0d2e 60%, ${color}22 100%)` }} />
      {/* mountain silhouettes */}
      {[
        { left: "-5%", width: "50%", height: "55%", clip: "polygon(0 100%, 50% 0%, 100% 100%)" },
        { left: "35%", width: "45%", height: "70%", clip: "polygon(0 100%, 45% 5%, 100% 100%)" },
        { left: "65%", width: "40%", height: "50%", clip: "polygon(0 100%, 55% 10%, 100% 100%)" },
      ].map((m, i) => (
        <div key={i} style={{ position: "absolute", bottom: 0, left: m.left, width: m.width, height: m.height,
          background: `linear-gradient(to top, #0d0718, #1a0d2e)`, clipPath: m.clip }} />
      ))}
      {/* lava glow at base */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "20%",
        background: `radial-gradient(ellipse at 50% 100%, ${color}55 0%, transparent 70%)` }} />
      {/* fire particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} animate={{ y: [0, -60 - i * 10], opacity: [0.9, 0], scale: [0.5, 0] }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
          style={{ position: "absolute", bottom: "18%", left: `${30 + (i * 37) % 40}%`, width: 4 + (i % 3) * 2, height: 8 + (i % 3) * 3,
            borderRadius: "50% 50% 20% 20%", background: `linear-gradient(to top, ${color}, ${accentColor})`,
            filter: "blur(1px)", boxShadow: `0 0 6px ${color}` }} />
      ))}
      {/* moon */}
      <div style={{ position: "absolute", top: "12%", right: "15%", width: 36, height: 36, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, #fff8e7, #d4a843)`, boxShadow: "0 0 24px rgba(212,168,67,0.6)" }} />
    </div>
  );

  if (kind === "medieval") return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0e0c07 0%, #1a1508 60%, ${color}1a 100%)` }} />
      {/* castle tower */}
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: "65%",
        background: "linear-gradient(to top, #1a1508, #2a2010)", border: `1px solid ${color}44` }}>
        {/* battlements */}
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ position: "absolute", top: -12, left: `${i * 25}%`, width: "20%", height: 16,
            background: "#1a1508", border: `1px solid ${color}44` }} />
        ))}
        {/* window glow */}
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 16, height: 22,
            background: color, borderRadius: "40% 40% 0 0", boxShadow: `0 0 30px ${color}cc, 0 0 60px ${color}55` }} />
      </div>
      {/* flanking towers */}
      {[-55, 55].map((offset, i) => (
        <div key={i} style={{ position: "absolute", bottom: 0, left: `calc(50% + ${offset}px)`, width: 36, height: "45%",
          background: "linear-gradient(to top, #12100a, #1e1a0e)", border: `1px solid ${color}33` }} />
      ))}
      {/* torch glows */}
      {[-45, 45].map((offset, i) => (
        <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          style={{ position: "absolute", bottom: "44%", left: `calc(50% + ${offset}px)`, width: 14, height: 14, borderRadius: "50%",
            background: color, boxShadow: `0 0 24px ${color}, 0 0 48px ${color}66` }} />
      ))}
      {/* stars */}
      {[...Array(14)].map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.1, 0.7, 0.1] }} transition={{ duration: 3 + i % 3, repeat: Infinity, delay: i * 0.3 }}
          style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8c97e",
            top: `${(i * 19 + 5) % 55}%`, left: `${(i * 31 + 11) % 95}%` }} />
      ))}
    </div>
  );

  // night / vampire
  return (
    <div style={base}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #08020e 0%, #12001e 70%, ${color}22 100%)` }} />
      {/* full moon */}
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 64, height: 64, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #fff8f0, #c8b0c0)", boxShadow: "0 0 50px rgba(255,220,240,0.5), 0 0 100px rgba(227,25,55,0.2)" }} />
      {/* fog layers */}
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ x: [0, i % 2 === 0 ? 30 : -30, 0] }} transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          style={{ position: "absolute", bottom: `${i * 12}%`, left: -40, right: -40, height: 40,
            background: `rgba(227,25,55,${0.04 + i * 0.02})`, filter: "blur(12px)", borderRadius: "50%" }} />
      ))}
      {/* gothic spire */}
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
        borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: `140px solid #120008` }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 40, height: "50%",
        background: "linear-gradient(to top, #120008, #1e000e)" }} />
      {/* window */}
      <motion.div animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "30%", left: "50%", transform: "translateX(-50%)", width: 14, height: 20,
          background: color, borderRadius: "40% 40% 0 0", boxShadow: `0 0 30px ${color}cc` }} />
      {/* bats */}
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ x: [0, (i % 2 === 0 ? 40 : -40)], y: [0, -20, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }}
          style={{ position: "absolute", top: `${25 + i * 8}%`, left: `${30 + i * 15}%`, fontSize: 14, color: "#4a0010", filter: "brightness(0.5)" }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill={`${color}88`}>
            <path d="M8 5 C6 1, 1 0, 0 3 C2 4, 4 6, 8 5 C12 6, 14 4, 16 3 C15 0, 10 1, 8 5Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function UniverseCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", padding: "20px 0 80px", overflow: "hidden" }}>
      {/* Section heading */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
        style={{ textAlign: "center", marginBottom: 12, padding: "0 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--violet2)", marginBottom: 12 }}>
          The multiverse is already out there
        </p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>
          Six worlds waiting to be explored.
        </h2>
      </motion.div>

      {/* Horizontal scroll track */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "nowrap",
          gap: 20,
          overflowX: "auto",
          overflowY: "visible",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch" as any,
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 32,
          paddingTop: 24,
          scrollbarWidth: "none",
          msOverflowStyle: "none" as any,
          cursor: "grab",
        }}
        onMouseDown={e => {
          const el = scrollRef.current;
          if (!el) return;
          const startX = e.pageX - el.offsetLeft;
          const scrollLeft = el.scrollLeft;
          el.style.cursor = "grabbing";
          const onMove = (ev: MouseEvent) => { el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX); };
          const onUp = () => { el.style.cursor = "grab"; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        {WORLDS.map((world, i) => (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 340,
              height: 500,
              borderRadius: 20,
              overflow: "hidden",
              scrollSnapAlign: "start",
              cursor: "default",
              border: `1px solid ${world.color}33`,
              background: "#08020e",
              boxShadow: `0 32px 80px -24px ${world.color}55, 0 0 0 1px ${world.color}1a`,
              fontFamily: "Sora, sans-serif",
              textAlign: "left",
              animation: `float ${6.5 + (i % 3) * 0.7}s ease-in-out infinite`,
              animationDelay: `${world.floatDelay}s`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Cinematic art — top 60% */}
            <div style={{ position: "relative", height: "62%", flexShrink: 0 }}>
              <WorldArt kind={world.artKind} color={world.color} accentColor={world.accentColor} />
              {/* gradient fade into card body */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
                background: "linear-gradient(to top, #08020e, transparent)", zIndex: 10 }} />
              {/* era badge top-left */}
              <div style={{ position: "absolute", top: 14, left: 14, zIndex: 20,
                padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: "rgba(8,2,14,0.7)", backdropFilter: "blur(8px)",
                border: `1px solid ${world.color}44`, color: world.color }}>
                {world.era}
              </div>
            </div>

            {/* Card body — bottom 38% */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 22px 20px", position: "relative" }}>
              {/* Universe name */}
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: 8, lineHeight: 1.2 }}>
                {world.name}
              </h3>
              {/* Teaser */}
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, flex: 1, fontWeight: 300 }}>
                {world.teaser}
              </p>
              {/* Transmission preview */}
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 10,
                background: `${world.color}0d`, border: `1px solid ${world.color}2a` }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: world.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${world.color}` }} />
                <span style={{ fontSize: 11, color: world.color, fontWeight: 500, letterSpacing: "0.04em" }}>
                  {world.transmission}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll track fade hints */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 120, pointerEvents: "none",
        background: "linear-gradient(to left, var(--bg,#08090d), transparent)", zIndex: 10 }} />
    </div>
  );
}

type VisualKind = "resume" | "orbit" | "signal" | "drift" | "shadow" | "council" | "chronicle";
interface JourneyStep { icon: LucideIcon; color: string; title: string; body: string; quote?: string; visual: VisualKind; }

const JOURNEY: JourneyStep[] = [
  { icon: FileText, color: "#7c6ef7", title: "The Résumé", visual: "resume",
    body: "You upload a résumé.\n\nNot a list of jobs. Not a collection of skills.\n\nA map of decisions, ambitions, risks, and unfinished stories." },
  { icon: Globe2, color: "#4ecdc4", title: "Alternate Futures", visual: "orbit",
    body: "The AI uncovers six lives hidden within your story — a starship commander, a pirate captain, a dragon sage, a vampire archivist, a royal advisor, a cyberpunk visionary." },
  { icon: Radio, color: "#9d91ff", title: "The First Transmission", visual: "signal",
    body: "Then something unexpected happens. A message arrives.\n\nThe sender claims to be you. Thirty years from now.",
    quote: "Can you hear me?" },
  { icon: AlertTriangle, color: "#e8c97e", title: "Timeline Drift", visual: "drift",
    body: "Every conversation changes the future.\n\nMemories begin to diverge. Timelines fracture. The person contacting you starts remembering a different life." },
  { icon: Eye, color: "#f07070", title: "The Shadow", visual: "shadow",
    body: "Not every future became who you hoped.\n\nOne version of you chose a darker path — and now they've found a way to reach you." },
  { icon: Scale, color: "#9d91ff", title: "Council of Selves", visual: "council",
    body: "The futures gather. They debate your choices, challenge your beliefs, reveal uncomfortable truths — and force you to decide who you want to become." },
  { icon: BookOpen, color: "#ffc278", title: "Your Chronicle", visual: "chronicle",
    body: "Every decision becomes part of a living historical record.\n\nAs you explore, the Historian records new editions — each one a snapshot of who you were becoming.\n\nA growing archive. Never a final chapter." },
];

/* ── Animated per-step visuals ── */
function JourneyVisual({ kind, color }: { kind: VisualKind; color: string }) {
  const box: React.CSSProperties = {
    height: 96, marginBottom: 18, borderRadius: 12, position: "relative", overflow: "hidden",
    background: `radial-gradient(circle at 50% 40%, ${color}14, transparent 70%)`,
    border: `1px solid ${color}1f`, display: "flex", alignItems: "center", justifyContent: "center",
  };
  const dot = (extra: React.CSSProperties): React.CSSProperties => ({ position: "absolute", borderRadius: "50%", background: color, ...extra });

  if (kind === "resume") {
    return (
      <div style={box}>
        {/* document lines */}
        <div style={{ width: 86, display: "flex", flexDirection: "column", gap: 6 }}>
          {[100, 80, 92, 60].map((w, i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
              style={{ height: 4, width: `${w}%`, borderRadius: 3, background: `${color}99` }} />
          ))}
        </div>
        {/* rising data motes */}
        {[0, 1, 2, 3].map(i => (
          <motion.span key={i} animate={{ y: [20, -40], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}
            style={dot({ right: 22 + i * 12, bottom: 20, width: 4, height: 4, boxShadow: `0 0 6px ${color}` })} />
        ))}
      </div>
    );
  }
  if (kind === "orbit" || kind === "council") {
    return (
      <div style={box}>
        <span style={dot({ width: 12, height: 12, boxShadow: `0 0 12px ${color}` })} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: kind === "orbit" ? 10 : 16, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", width: 76, height: 76 }}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span key={deg} style={dot({
              width: 7, height: 7, top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateX(38px) translate(-50%,-50%)`,
              boxShadow: `0 0 8px ${color}`,
            })} />
          ))}
        </motion.div>
      </div>
    );
  }
  if (kind === "signal") {
    return (
      <div style={box}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ scale: [0.3, 1.6], opacity: [0.7, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${color}` }} />
        ))}
        <span style={dot({ width: 10, height: 10, position: "relative", boxShadow: `0 0 12px ${color}` })} />
      </div>
    );
  }
  if (kind === "drift") {
    return (
      <div style={box}>
        <div style={{ position: "absolute", left: 16, right: 16, top: "50%", height: 2, background: `${color}55` }} />
        <motion.div animate={{ rotate: [0, -14, -10] }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
          style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 2, background: color, transformOrigin: "left center", boxShadow: `0 0 8px ${color}` }} />
        <motion.div animate={{ rotate: [0, 14, 9] }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", delay: 0.3 }}
          style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 2, background: `${color}88`, transformOrigin: "left center" }} />
        <span style={dot({ left: "50%", top: "50%", width: 8, height: 8, transform: "translate(-50%,-50%)", boxShadow: `0 0 10px ${color}` })} />
      </div>
    );
  }
  if (kind === "shadow") {
    return (
      <div style={{ ...box, background: "radial-gradient(circle at 50% 40%, rgba(240,112,112,0.12), transparent 70%)" }}>
        <div className="scanlines" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        <motion.div animate={{ x: [0, -2, 2, 0], opacity: [0.85, 1, 0.7, 0.85] }} transition={{ duration: 0.5, repeat: Infinity }}
          style={{ fontSize: 34, color, textShadow: `-2px 0 rgba(78,205,196,0.6), 2px 0 ${color}` }}>
          <Eye size={34} color={color} strokeWidth={2} />
        </motion.div>
      </div>
    );
  }
  // chronicle — opening book
  return (
    <div style={box}>
      <div style={{ display: "flex", perspective: 300 }}>
        <motion.div animate={{ rotateY: [-50, -20, -50] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 40, height: 56, background: `linear-gradient(90deg, ${color}55, ${color}22)`, borderRadius: "4px 0 0 4px", transformOrigin: "right center", border: `1px solid ${color}55` }} />
        <motion.div animate={{ rotateY: [50, 20, 50] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 40, height: 56, background: `linear-gradient(270deg, ${color}55, ${color}22)`, borderRadius: "0 4px 4px 0", transformOrigin: "left center", border: `1px solid ${color}55` }} />
      </div>
    </div>
  );
}

function JourneyCard({ step, index, align }: { step: JourneyStep; index: number; align: "left" | "right" }) {
  return (
    <div className="lo-journey-card" style={{
      maxWidth: 380, textAlign: align,
      background: "linear-gradient(160deg, var(--surface), var(--bg2))",
      border: `1px solid ${step.color}33`, borderRadius: 18, padding: "24px 26px",
      boxShadow: `0 16px 48px -20px ${step.color}55`,
    }}>
      <JourneyVisual kind={step.visual} color={step.color} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
        justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: step.color }}>
          Step {index + 1}
        </span>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: 12 }}>{step.title}</h3>
      <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{step.body}</p>
      {step.quote && (
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 12, display: "inline-block",
          background: `${step.color}14`, border: `1px solid ${step.color}33`,
          fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 16, color: "var(--text)",
        }}>
          &ldquo;{step.quote}&rdquo;
        </div>
      )}
    </div>
  );
}
