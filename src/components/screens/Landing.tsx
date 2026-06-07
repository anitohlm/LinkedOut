"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText, Globe2, Radio, AlertTriangle, Eye, Scale, BookOpen, type LucideIcon,
} from "lucide-react";
import { AppState, AppScreenState } from "@/types";
import { getAllUniverses } from "@/lib/universes";

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
            <button
              onClick={() => { onNewGame?.(); transitionTo("upload-resume"); }}
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
    body: "Every decision becomes part of a living story.\n\nNot a personality report. Not a career assessment.\n\nA chronicle of every life you could have lived." },
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
