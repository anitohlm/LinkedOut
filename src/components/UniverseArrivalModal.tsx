"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlternateProfile, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";

interface Props {
  universeId: UniverseType;
  profile: AlternateProfile;
  onDismiss: () => void;
}

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function rgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Darken color for backgrounds (mix toward near-black)
function darkBg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  // very dark tint of the color
  return `rgb(${Math.round(r * 0.06)},${Math.round(g * 0.05)},${Math.round(b * 0.07)})`;
}
function darkBg2(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r * 0.04)},${Math.round(g * 0.03)},${Math.round(b * 0.05)})`;
}

// ── Shared components ─────────────────────────────────────────────────────────

function FadeLines({ lines, rm, baseDelay = 0 }: {
  lines: React.ReactNode[];
  rm: boolean;
  baseDelay?: number;
}) {
  return (
    <>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={rm ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rm ? 0 : baseDelay + i * 0.18, duration: 0.45, ease: "easeOut" }}
        >
          {line}
        </motion.div>
      ))}
    </>
  );
}

function ArrivalButton({ label, onDismiss, color, textColor }: {
  label: string;
  onDismiss: () => void;
  color: string;
  textColor: string;
}) {
  return (
    <div style={{ marginTop: 32 }}>
      <button
        onClick={onDismiss}
        autoFocus
        style={{
          width: "100%", padding: "14px 0", borderRadius: 12,
          cursor: "pointer", border: "none",
          background: color, color: textColor,
          fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
          fontFamily: "inherit", minHeight: 48, touchAction: "manipulation",
          boxShadow: `0 8px 24px -8px ${rgba(color, 0.55)}`,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        {label}
      </button>
    </div>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────────

function ArrivalShell({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: `linear-gradient(160deg, ${darkBg(color)} 0%, ${darkBg2(color)} 60%, ${darkBg(color)} 100%)`,
      border: `1px solid ${rgba(color, 0.28)}`,
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: `0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px ${rgba(color, 0.1)}, inset 0 1px 0 ${rgba(color, 0.15)}`,
      position: "relative",
    }}>
      {/* Ambient corner glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%",
        background: `radial-gradient(circle, ${rgba(color, 0.12)} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent 5%, ${rgba(color, 0.85)}, transparent 95%)` }} />
      {children}
    </div>
  );
}

// ── MEDIEVAL ──────────────────────────────────────────────────────────────────
function MedievalArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const [sealBroken, setSealBroken] = useState(rm);

  return (
    <ArrivalShell color={color}>
      {/* Parchment line texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)",
      }} />

      <div style={{ padding: "36px 36px 32px", fontFamily: "'Crimson Pro', Georgia, serif", position: "relative" }}>
        <AnimatePresence mode="wait">
          {!sealBroken ? (
            <motion.div
              key="seal"
              initial={rm ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={rm ? {} : { scale: 1.3, opacity: 0, rotate: 18 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 24px" }}
            >
              <div
                onClick={() => setSealBroken(true)}
                style={{
                  width: 80, height: 80, borderRadius: "50%", cursor: "pointer",
                  background: `radial-gradient(circle at 40% 35%, ${color}, ${rgba(color, 0.6)})`,
                  border: `3px solid ${rgba(color, 0.55)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 28px ${rgba(color, 0.35)}, inset 0 2px 4px rgba(255,255,255,0.15)`,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z" fill={darkBg2(color)} stroke={darkBg2(color)} strokeWidth="0.5"/>
                  <circle cx="12" cy="12" r="10" stroke={darkBg2(color)} strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <p style={{ fontSize: 12, color: rgba(color, 0.45), letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 14, fontFamily: "Sora, sans-serif" }}>
                Break the Royal Seal to proceed
              </p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={rm ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: rgba(color, 0.5), marginBottom: 18, fontFamily: "Sora, sans-serif" }}>
                Royal Proclamation
              </p>
              <FadeLines rm={rm} baseDelay={0.1} lines={[
                <p style={{ fontSize: 15, color: rgba(color, 0.9), fontStyle: "italic", marginBottom: 20, lineHeight: 1.7 }}>Traveler,</p>,
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: rgba(color, 0.4), letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "Sora, sans-serif" }}>You have arrived in</p>
                  <h2 style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "0.06em", lineHeight: 1.2 }}>{profile.worldName}</h2>
                </div>,
                <div style={{ marginBottom: 20, paddingLeft: 16, borderLeft: `2px solid ${rgba(color, 0.22)}` }}>
                  <p style={{ fontSize: 11, color: rgba(color, 0.4), letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "Sora, sans-serif" }}>Era</p>
                  <p style={{ fontSize: 16, color: rgba(color, 0.75), fontStyle: "italic" }}>{profile.eraName}</p>
                </div>,
                <p style={{ fontSize: 15, color: rgba(color, 0.6), lineHeight: 1.75, marginBottom: 20 }}>
                  This realm values honor, loyalty, and service. The history of {profile.worldName} is still being written.
                </p>,
                <div style={{ background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}`, borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontSize: 11, color: rgba(color, 0.4), letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora, sans-serif" }}>In this reality, you are known as</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "0.04em" }}>{profile.alternativeName}</p>
                  <p style={{ fontSize: 14, color: rgba(color, 0.7), fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
                </div>,
                <p style={{ fontSize: 14, color: rgba(color, 0.4), fontStyle: "italic", lineHeight: 1.7, marginTop: 20 }}>Your choices may become part of that story.</p>,
              ]} />
              <ArrivalButton label={`Enter ${profile.worldName}`} onDismiss={onDismiss} color={color} textColor={darkBg2(color)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ArrivalShell>
  );
}

// ── CYBERPUNK ─────────────────────────────────────────────────────────────────
function TypewriterLine({ text, delay, rm, style }: { text: string; delay: number; rm: boolean; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState(rm ? text : "");
  useEffect(() => {
    if (rm) return;
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => { setDisplayed(text.slice(0, ++i)); if (i >= text.length) clearInterval(iv); }, 28);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [text, delay, rm]);
  return <div style={style}>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>█</span></div>;
}

function CyberpunkArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  return (
    <ArrivalShell color={color}>
      {/* Scan line */}
      {!rm && (
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", left: 0, right: 0, height: 2, zIndex: 5, background: `linear-gradient(90deg, transparent, ${rgba(color, 0.2)}, transparent)`, pointerEvents: "none" }}
        />
      )}
      <div style={{ padding: "32px 36px 28px", position: "relative", fontFamily: "'Share Tech Mono', 'Courier New', monospace" }}>
        <TypewriterLine text="// INITIALIZING CONNECTION..." delay={0} rm={rm}
          style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 24, letterSpacing: "0.06em" }} />
        <FadeLines rm={rm} baseDelay={0.8} lines={[
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: rgba(color, 0.4), letterSpacing: "0.14em", marginBottom: 4 }}>// IDENTITY DETECTED</p>
            <div style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 8 }}>USER:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: "0.08em", textShadow: `0 0 16px ${rgba(color, 0.55)}` }}>{profile.alternativeName}</div>
            <div style={{ fontSize: 13, color: rgba(color, 0.65), marginTop: 6 }}>{profile.profession}</div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 4 }}>LOCATION:</div>
            <div style={{ fontSize: 16, color: rgba(color, 0.9), letterSpacing: "0.06em" }}>{profile.worldName}</div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 4 }}>ERA:</div>
            <div style={{ fontSize: 16, color: rgba(color, 0.9), letterSpacing: "0.06em" }}>{profile.eraName}</div>
          </div>,
          <div style={{ height: 1, background: rgba(color, 0.12), margin: "4px 0 20px" }} />,
          <p style={{ fontSize: 13, color: rgba(color, 0.65), lineHeight: 1.75 }}>
            In this reality, memories, knowledge, and experiences are preserved within the Grid. Your alternate self shapes what humanity remembers — and what it forgets.
          </p>,
          <TypewriterLine text="// CONNECTION ESTABLISHED. WELCOME." delay={0} rm={rm}
            style={{ fontSize: 11, color, marginTop: 20, letterSpacing: "0.06em" }} />,
        ]} />
        <ArrivalButton label="ACCESS GRID" onDismiss={onDismiss} color={color} textColor={darkBg2(color)} />
      </div>
    </ArrivalShell>
  );
}

// ── PIRATE ────────────────────────────────────────────────────────────────────
function PirateArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  return (
    <ArrivalShell color={color}>
      {/* Subtle wave shimmer */}
      {!rm && (
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, ${rgba(color, 0.05)} 20px, ${rgba(color, 0.05)} 21px)` }}
        />
      )}
      <div style={{ padding: "36px 36px 28px", position: "relative", fontFamily: "'Sora', sans-serif" }}>
        {/* Compass */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.div
            animate={rm ? {} : { rotate: [0, 5, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="24" stroke={rgba(color, 0.3)} strokeWidth="1.5" />
              <circle cx="26" cy="26" r="18" stroke={rgba(color, 0.15)} strokeWidth="1" />
              <path d="M26 8l3 16-3 2-3-2z" fill={color} />
              <path d="M26 44l-3-16 3-2 3 2z" fill={rgba(color, 0.35)} />
              <circle cx="26" cy="26" r="3" fill={color} />
              {(["N","E","S","W"] as const).map((d, i) => (
                <text key={d} x={26 + (i===1?19:i===3?-19:0)} y={26 + (i===0?-12:i===2?16:4)} textAnchor="middle" fill={rgba(color, 0.6)} fontSize="8" fontFamily="Sora,sans-serif">{d}</text>
              ))}
            </svg>
          </motion.div>
        </div>
        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 12, color: rgba(color, 0.5), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic" }}>Captain's Log</p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 6 }}>{profile.worldName}</h2>
            <p style={{ fontSize: 14, color: rgba(color, 0.55), fontStyle: "italic" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: rgba(color, 0.65), lineHeight: 1.75, marginBottom: 20 }}>
            The seas connect hundreds of islands, cultures, and stories. Those who master the tides shape the future of entire nations.
          </p>,
          <div style={{ background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Your name is known among navigators</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-0.2px" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: rgba(color, 0.7), fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 14, color: rgba(color, 0.45), fontStyle: "italic", lineHeight: 1.7 }}>May favorable winds guide your journey.</p>,
        ]} />
        <ArrivalButton label="Set Sail" onDismiss={onDismiss} color={color} textColor={darkBg2(color)} />
      </div>
    </ArrivalShell>
  );
}

// ── DRAGON ────────────────────────────────────────────────────────────────────
function DragonArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const embers = Array.from({ length: 12 }, (_, i) => i);
  return (
    <ArrivalShell color={color}>
      {!rm && embers.map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", width: 2, height: 2, borderRadius: "50%",
            background: i % 2 === 0 ? color : rgba(color, 0.6),
            left: `${10 + (i * 73) % 80}%`, bottom: 0, pointerEvents: "none", zIndex: 0,
          }}
          animate={{ y: [0, -(80 + (i * 37) % 160)], opacity: [0, 0.8, 0], x: [i % 2 ? 4 : -4] }}
          transition={{ duration: 2 + (i * 0.3) % 2, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <div style={{ padding: "36px 36px 28px", position: "relative", zIndex: 1, fontFamily: "'Cinzel', Georgia, serif" }}>
        {/* Rune glyph */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.svg width="60" height="60" viewBox="0 0 60 60" fill="none"
            animate={rm ? {} : { filter: [`drop-shadow(0 0 4px ${rgba(color, 0.3)})`, `drop-shadow(0 0 14px ${rgba(color, 0.75)})`, `drop-shadow(0 0 4px ${rgba(color, 0.3)})`] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <polygon points="30,4 56,48 4,48" stroke={rgba(color, 0.4)} strokeWidth="1.5" fill="none" />
            <polygon points="30,12 50,44 10,44" stroke={rgba(color, 0.22)} strokeWidth="1" fill="none" />
            <path d="M30 18v18M22 36l8-18 8 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="30" cy="30" r="3" fill={color} />
          </motion.svg>
        </div>
        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16, fontFamily: "Sora,sans-serif" }}>Ancient Inscription</p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "0.08em", lineHeight: 1.2, marginBottom: 6 }}>{profile.worldName}</h2>
            <p style={{ fontSize: 14, color: rgba(color, 0.55), letterSpacing: "0.06em" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: rgba(color, 0.62), lineHeight: 1.8, marginBottom: 20 }}>
            This land is shaped by dragons, ancient wisdom, and elemental power. Knowledge is earned. Power is respected. Legacy is remembered.
          </p>,
          <div style={{ background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}`, borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora,sans-serif" }}>Your deeds are part of this living history</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "0.04em" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: rgba(color, 0.7), fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
        ]} />
        <ArrivalButton label="Enter the Dominion" onDismiss={onDismiss} color={color} textColor={darkBg2(color)} />
      </div>
    </ArrivalShell>
  );
}

// ── GALACTIC ──────────────────────────────────────────────────────────────────
function GalacticArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const stars = Array.from({ length: 30 }, (_, i) => i);
  return (
    <ArrivalShell color={color}>
      {!rm && stars.map(i => (
        <motion.div key={i}
          style={{ position: "absolute", width: 1.5, height: 1.5, borderRadius: "50%", background: "#fff", opacity: 0.3, left: `${(i * 37 + 5) % 95}%`, top: `${(i * 53 + 3) % 90}%`, pointerEvents: "none" }}
          animate={{ opacity: [0.15, 0.65, 0.15] }}
          transition={{ duration: 2 + (i % 3), delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div style={{ padding: "32px 36px 28px", position: "relative", zIndex: 1, fontFamily: "'Exo 2', 'Sora', sans-serif" }}>
        {/* Transmission badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "8px 14px", borderRadius: 8, background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}` }}>
          <motion.div
            animate={rm ? {} : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: rgba(color, 0.75), letterSpacing: "0.14em", textTransform: "uppercase" }}>Interstellar Transmission Incoming</span>
        </div>
        <FadeLines rm={rm} baseDelay={0.3} lines={[
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: rgba(color, 0.45), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>TRAVELER DETECTED</p>
            <div style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 4 }}>LOCATION:</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "0.06em", textShadow: `0 0 20px ${rgba(color, 0.35)}` }}>{profile.worldName}</div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: rgba(color, 0.5), marginBottom: 4 }}>ERA:</div>
            <div style={{ fontSize: 15, color: rgba(color, 0.85), letterSpacing: "0.06em" }}>{profile.eraName}</div>
          </div>,
          <p style={{ fontSize: 14, color: rgba(color, 0.6), lineHeight: 1.75, marginBottom: 20 }}>
            Humanity has expanded beyond Earth. New colonies, distant systems, and unexplored frontiers await discovery.
          </p>,
          <div style={{ background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}`, borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Your alternate self stands among the frontier</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "0.06em", textShadow: `0 0 12px ${rgba(color, 0.3)}` }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: rgba(color, 0.75), marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 13, color: rgba(color, 0.45), letterSpacing: "0.06em", marginTop: 16, textTransform: "uppercase" }}>Exploration begins now.</p>,
        ]} />
        <ArrivalButton label="Begin Mission" onDismiss={onDismiss} color={color} textColor={darkBg2(color)} />
      </div>
    </ArrivalShell>
  );
}

// ── VAMPIRE ───────────────────────────────────────────────────────────────────
function VampireArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const particles = Array.from({ length: 16 }, (_, i) => i);
  return (
    <ArrivalShell color={color}>
      {!rm && particles.map(i => (
        <motion.div key={i}
          style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: i % 2 === 0 ? color : rgba(color, 0.6), left: `${(i * 59 + 8) % 90}%`, top: `${(i * 43 + 5) % 90}%`, pointerEvents: "none" }}
          animate={{ y: [0, -12, 0], opacity: [0.15, 0.55, 0.15], x: [0, i % 2 ? 4 : -4, 0] }}
          transition={{ duration: 3 + (i % 4), delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div style={{ padding: "36px 36px 28px", position: "relative", zIndex: 1, fontFamily: "'Crimson Pro', Georgia, serif" }}>
        {/* Moon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.div
            animate={rm ? {} : { filter: [`drop-shadow(0 0 6px ${rgba(color, 0.3)})`, `drop-shadow(0 0 18px ${rgba(color, 0.75)})`, `drop-shadow(0 0 6px ${rgba(color, 0.3)})`] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="22" stroke={rgba(color, 0.22)} strokeWidth="1" />
              <path d="M32 14a14 14 0 1 0 0 24 10 10 0 0 1 0-24z" fill={color} opacity="0.75" />
            </svg>
          </motion.div>
        </div>
        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontFamily: "Sora,sans-serif" }}>A forgotten memory surfaces</p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: 6, fontStyle: "italic" }}>{profile.worldName}</h2>
            <p style={{ fontSize: 14, color: rgba(color, 0.55), fontStyle: "italic" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: rgba(color, 0.6), lineHeight: 1.85, marginBottom: 20, fontStyle: "italic" }}>
            In this world, memories are treasured, secrets endure, and shadows carry stories of their own. The night has lasted longer than anyone remembers.
          </p>,
          <div style={{ background: rgba(color, 0.07), border: `1px solid ${rgba(color, 0.18)}`, borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: rgba(color, 0.45), letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora,sans-serif" }}>Your alternate self walks paths few dare follow</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, fontStyle: "italic" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: rgba(color, 0.7), fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 14, color: rgba(color, 0.4), fontStyle: "italic", lineHeight: 1.7, marginTop: 20 }}>Listen carefully. The city remembers.</p>,
        ]} />
        <ArrivalButton label="Follow the Whisper" onDismiss={onDismiss} color={color} textColor="#fff" />
      </div>
    </ArrivalShell>
  );
}

// ── Registry ──────────────────────────────────────────────────────────────────
const ARRIVAL_COMPONENTS: Record<UniverseType, React.ComponentType<{ profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string }>> = {
  medieval:  MedievalArrival,
  cyberpunk: CyberpunkArrival,
  pirate:    PirateArrival,
  dragon:    DragonArrival,
  galactic:  GalacticArrival,
  vampire:   VampireArrival,
};

// ── Root modal ────────────────────────────────────────────────────────────────
export default function UniverseArrivalModal({ universeId, profile, onDismiss }: Props) {
  const rm = useReducedMotion() ?? false;
  const color = getUniverse(universeId).color;
  const ArrivalContent = ARRIVAL_COMPONENTS[universeId];
  if (!ArrivalContent) return null;

  // Vampire (#E31937) is a very saturated red — white text reads better on it
  // All other universe colors are light enough to use the dark bg as text color
  const [r, g, b] = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const _ = luminance; // used by VampireArrival to decide text color (light colors → dark text)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: rm ? 0.1 : 0.3 }}
        style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: `rgba(2,3,6,0.92)`,
          backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px 20px", overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Arrival in ${profile.worldName}`}
      >
        <motion.div
          initial={rm ? false : { opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={rm ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: rm ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <ArrivalContent profile={profile} onDismiss={onDismiss} rm={rm} color={color} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
