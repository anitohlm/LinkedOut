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

// ── WhisperText — word-by-word fade-in for Vampire manuscript ─────────────────

function WhisperText({ text, delay, rm, style }: {
  text: string; delay: number; rm: boolean; style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={rm ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.09, duration: 0.55, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.27em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
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

// ── MEDIEVAL — parchment scroll with wooden rollers, unfurls top→bottom ───────

function ScrollRoller({ position }: { position: "top" | "bottom" }) {
  return (
    <div style={{
      height: 26,
      borderRadius: position === "top" ? "14px 14px 0 0" : "0 0 14px 14px",
      background: "linear-gradient(180deg, #d9aa60 0%, #a06828 22%, #7a4e18 50%, #a06828 78%, #d9aa60 100%)",
      boxShadow: position === "top"
        ? "0 8px 24px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,220,100,0.3)"
        : "0 -6px 16px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(0,0,0,0.3)",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {/* Wood grain lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${4 + i * 6.8}%`, width: 1,
          background: "rgba(0,0,0,0.07)",
        }} />
      ))}
      {/* End knobs */}
      {[3.5, 96.5].map(x => (
        <div key={x} style={{
          position: "absolute", top: "50%", left: `${x}%`,
          transform: "translate(-50%,-50%)",
          width: 18, height: 18, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #e8c070, #6a3e10)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4)",
        }} />
      ))}
    </div>
  );
}

function MedievalArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const [sealBroken, setSealBroken] = useState(rm);

  // Parchment palette — Academia/Scholarly style
  const ink     = "#1a0e06";   // main ink (mahogany-dark)
  const inkMid  = "#3d2210";   // secondary ink
  const inkFade = "#7a5c38";   // muted ink
  const waxRed  = "#8B2635";   // classic wax seal crimson

  return (
    <div style={{ maxWidth: 500, width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top roller — always visible, scroll unfurls below it */}
      <ScrollRoller position="top" />

      {/* Parchment body — clips from top→bottom (unfurl) */}
      <motion.div
        initial={rm ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div style={{
          background: "linear-gradient(170deg, #f5e9c4 0%, #edd898 42%, #f2e4b8 100%)",
          position: "relative", fontFamily: "'Crimson Pro', Georgia, serif",
          // Vignette edges
          boxShadow: "inset 0 0 50px rgba(90,50,8,0.14), inset 6px 0 18px rgba(90,50,8,0.08), inset -6px 0 18px rgba(90,50,8,0.08)",
        }}>
          {/* Ruled paper lines */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(90,55,10,0.045) 27px, rgba(90,55,10,0.045) 28px)",
          }} />
          {/* Side age spots */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 0% 50%, rgba(90,50,8,0.07) 0%, transparent 45%), radial-gradient(ellipse at 100% 50%, rgba(90,50,8,0.07) 0%, transparent 45%)",
          }} />

          <div style={{ padding: "28px 36px 28px", position: "relative" }}>
            <AnimatePresence mode="wait">
              {!sealBroken ? (
                /* ── SEALED STATE ── */
                <motion.div
                  key="sealed"
                  initial={rm ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={rm ? {} : { opacity: 0 }}
                  transition={{ duration: 0.35, delay: rm ? 0 : 0.6 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 20px", gap: 0 }}
                >
                  {/* Ornamental header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, width: "100%" }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}55)` }} />
                    <span style={{ fontSize: 9, color: inkFade, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>Royal Proclamation</span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}55)` }} />
                  </div>

                  {/* Wax seal */}
                  <motion.div
                    onClick={() => setSealBroken(true)}
                    whileHover={rm ? {} : { scale: 1.06 }}
                    whileTap={rm ? {} : { scale: 0.94, rotate: 8 }}
                    style={{
                      width: 88, height: 88, borderRadius: "50%", cursor: "pointer",
                      background: `radial-gradient(circle at 38% 32%, #c43050, ${waxRed} 55%, #5a1018)`,
                      boxShadow: `0 6px 24px rgba(139,38,53,0.5), inset 0 2px 4px rgba(255,150,150,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", marginBottom: 18,
                    }}
                    aria-label="Break the royal seal"
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && setSealBroken(true)}
                  >
                    {/* Eldergrove realm emblem stamped into the wax */}
                    <img
                      src="/universe-icons/eldergrove-seal.png"
                      alt=""
                      width={64}
                      height={64}
                      style={{
                        width: 64, height: 64, objectFit: "contain",
                        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.45))",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Drip texture dots */}
                    {[{x:28,y:72},{x:62,y:78},{x:72,y:55}].map((d,i)=>(
                      <div key={i} style={{ position:"absolute", width:5, height:6, borderRadius:"50% 50% 60% 60%", background:"#7a1825", left:`${d.x}%`, top:`${d.y}%` }}/>
                    ))}
                  </motion.div>

                  <p style={{ fontSize: 12, color: inkFade, letterSpacing: "0.1em", fontStyle: "italic", textAlign: "center" }}>
                    Break the seal to read
                  </p>
                </motion.div>
              ) : (
                /* ── CONTENT STATE ── */
                <motion.div
                  key="content"
                  initial={rm ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Ornamental divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}60)` }} />
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1l1.5 4.5H15l-3.8 2.8 1.5 4.5L9 10l-3.7 2.8 1.5-4.5L3 5.5h4.5z" fill={color} opacity="0.7"/>
                    </svg>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}60)` }} />
                  </div>

                  <FadeLines rm={rm} baseDelay={0.05} lines={[
                    <p key="a" style={{ fontSize: 16, color: inkMid, fontStyle: "italic", marginBottom: 18, lineHeight: 1.7, fontFamily: "'Crimson Pro', serif" }}>
                      Greetings, noble soul!
                    </p>,
                    <div key="b" style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>Thou hast arrived upon the lands of</p>
                      <h2 style={{ fontSize: 28, fontWeight: 700, color: ink, letterSpacing: "0.04em", lineHeight: 1.15, fontFamily: "'Cinzel', Georgia, serif" }}>{profile.worldName}</h2>
                    </div>,
                    <div key="c" style={{ marginBottom: 18, paddingLeft: 14, borderLeft: `2px solid ${color}50` }}>
                      <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3, fontFamily: "'Cinzel', serif" }}>In the age known as</p>
                      <p style={{ fontSize: 15, color: inkMid, fontStyle: "italic", lineHeight: 1.5 }}>{profile.eraName}</p>
                    </div>,
                    <p key="d" style={{ fontSize: 14, color: inkMid, lineHeight: 1.85, marginBottom: 18, fontFamily: "'Crimson Pro', serif" }}>
                      Know thee well that this realm holdeth honour, fealty, and valour above all earthly measure. The chronicles of {profile.worldName} are yet unfinished — and Providence hath seen fit to inscribe thy name therein.
                    </p>,
                    <div key="e" style={{
                      background: "rgba(90,50,8,0.06)", border: `1px solid ${color}40`,
                      borderRadius: 8, padding: "14px 16px", marginBottom: 6,
                    }}>
                      <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Cinzel', serif" }}>In this realm, thou art known as</p>
                      <p style={{ fontSize: 22, fontWeight: 700, color: ink, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: "0.02em", lineHeight: 1.2 }}>{profile.alternativeName}</p>
                      <p style={{ fontSize: 13, color: inkFade, fontStyle: "italic", marginTop: 5 }}>{profile.profession}</p>
                    </div>,
                    <p key="f" style={{ fontSize: 13, color: inkFade, fontStyle: "italic", lineHeight: 1.75, marginTop: 14 }}>
                      May thy deeds ring forth through the ages, and thy legend endure long past the fading of the stars.
                    </p>,
                  ]} />

                  {/* Parchment CTA — styled as a wax-sealed banner */}
                  <div style={{ marginTop: 28 }}>
                    <button
                      onClick={onDismiss}
                      autoFocus
                      style={{
                        width: "100%", padding: "13px 0", cursor: "pointer",
                        background: ink, color: "#f0e4bc",
                        border: `1px solid ${color}60`,
                        borderRadius: 6, fontSize: 13, fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        fontFamily: "'Cinzel', Georgia, serif",
                        minHeight: 48, touchAction: "manipulation",
                        boxShadow: "0 4px 16px rgba(26,14,6,0.35)",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Enter {profile.worldName}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Bottom roller — fades in as scroll finishes unfurling */}
      <motion.div
        initial={rm ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: rm ? 0 : 0.75 }}
      >
        <ScrollRoller position="bottom" />
      </motion.div>
    </div>
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
      {/* Boot-from-black entrance: black screen fades to reveal */}
      {!rm && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, background: "#000",
            zIndex: 12, borderRadius: 20, pointerEvents: "none",
          }}
        />
      )}
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
  const [coverOpen, setCoverOpen] = useState(rm);
  useEffect(() => {
    if (rm) return;
    const t = setTimeout(() => setCoverOpen(true), 900);
    return () => clearTimeout(t);
  }, [rm]);

  // Weathered log palette
  const inkDark  = "#1c1008";
  const inkMid   = "#3a2210";
  const inkFade  = "#6b4828";
  const logPaper = "#e8d9b8";
  const logMid   = "#ddc99a";
  const logDark  = "#c9b07c";

  return (
    <div style={{ maxWidth: 500, width: "100%", perspective: "1200px" }}>
      <AnimatePresence mode="wait">
        {!coverOpen ? (
          /* ── CLOSED LOG COVER ── */
          <motion.div
            key="cover"
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -95, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.55, 0, 1, 0.45] }}
            style={{
              transformOrigin: "left center",
              background: [
                "repeating-linear-gradient(155deg, transparent, transparent 5px, rgba(0,0,0,0.04) 5px, rgba(0,0,0,0.04) 6px)",
                "linear-gradient(140deg, #2e1a08 0%, #1c0e04 50%, #2a1608 100%)",
              ].join(", "),
              borderRadius: 4,
              minHeight: 400,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              boxShadow: [
                "0 40px 100px rgba(0,0,0,0.98)",
                "6px 0 30px rgba(0,0,0,0.8)",
                `inset 0 1px 0 rgba(255,200,80,0.06)`,
                `inset 0 0 80px rgba(0,0,0,0.5)`,
              ].join(", "),
              border: `1px solid rgba(180,120,40,0.18)`,
              position: "relative", overflow: "hidden", gap: 10,
              padding: "44px 32px",
            }}
          >
            {/* Worn leather grain */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${5 + i * 10}%`, width: 1,
                background: "rgba(255,255,255,0.018)",
                transform: `rotate(${-3 + i * 0.6}deg)`,
              }} />
            ))}
            {/* Binding spine */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 24, width: 3, background: "rgba(0,0,0,0.5)", boxShadow: "2px 0 0 rgba(200,140,40,0.06), -1px 0 0 rgba(255,255,255,0.03)" }} />
            {/* Cover ornament — skull & crossbones */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 14, opacity: 0.75 }}>
              {/* Skull */}
              <ellipse cx="32" cy="26" rx="14" ry="13" fill={rgba(color, 0.15)} stroke={rgba(color, 0.5)} strokeWidth="1.2"/>
              <circle cx="26" cy="25" r="4" fill={rgba(color, 0.5)}/>
              <circle cx="38" cy="25" r="4" fill={rgba(color, 0.5)}/>
              <path d="M27 36 h10 M29 36 v4 M35 36 v4 M32 36 v4" stroke={rgba(color, 0.5)} strokeWidth="1.2" strokeLinecap="round"/>
              {/* Crossbones */}
              <line x1="10" y1="50" x2="54" y2="42" stroke={rgba(color, 0.4)} strokeWidth="3" strokeLinecap="round"/>
              <line x1="10" y1="42" x2="54" y2="50" stroke={rgba(color, 0.4)} strokeWidth="3" strokeLinecap="round"/>
              <circle cx="10" cy="46" r="4" fill={rgba(color, 0.3)} stroke={rgba(color, 0.4)} strokeWidth="1"/>
              <circle cx="54" cy="46" r="4" fill={rgba(color, 0.3)} stroke={rgba(color, 0.4)} strokeWidth="1"/>
            </svg>
            <p style={{ fontSize: 11, color: rgba(color, 0.55), letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "'Crimson Pro', Georgia, serif", fontWeight: 700 }}>Ship's Log</p>
            <div style={{ width: 80, height: "0.5px", background: `linear-gradient(90deg, transparent, ${rgba(color, 0.4)}, transparent)`, margin: "8px 0" }} />
            <p style={{ fontSize: 11, color: rgba(color, 0.25), letterSpacing: "0.08em", fontStyle: "italic", fontFamily: "'Crimson Pro', Georgia, serif" }}>Breaking seal…</p>
          </motion.div>
        ) : (
          /* ── OPEN LOG PAGES ── */
          <motion.div
            key="open"
            initial={rm ? false : { opacity: 0, rotateY: 15 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
          >
            {/* Weathered log paper */}
            <div style={{
              background: `linear-gradient(170deg, ${logPaper} 0%, ${logMid} 45%, ${logDark} 100%)`,
              borderRadius: 4,
              position: "relative", overflow: "hidden",
              boxShadow: [
                "0 40px 100px rgba(0,0,0,0.95)",
                "6px 0 24px rgba(0,0,0,0.6)",
                "inset 0 0 60px rgba(80,45,10,0.12)",
                "inset 4px 0 16px rgba(80,45,10,0.08)",
              ].join(", "),
              fontFamily: "'Crimson Pro', Georgia, serif",
            }}>
              {/* Ruled lines */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(80,45,10,0.055) 28px, rgba(80,45,10,0.055) 29px)",
              }} />
              {/* Water stain blotches */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: [
                  "radial-gradient(ellipse 140px 90px at 15% 25%, rgba(100,65,20,0.07) 0%, transparent 70%)",
                  "radial-gradient(ellipse 80px 60px at 85% 70%, rgba(80,50,15,0.06) 0%, transparent 70%)",
                  "radial-gradient(ellipse 60px 40px at 70% 15%, rgba(90,60,18,0.05) 0%, transparent 70%)",
                ].join(", "),
              }} />
              {/* Spine shadow */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 22, background: "linear-gradient(to right, rgba(0,0,0,0.18), transparent)", pointerEvents: "none" }} />

              <div style={{ padding: "28px 32px 28px 36px", position: "relative" }}>

                {/* Header — worn stamp style */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke={rgba(color, 0.5)} strokeWidth="1.2"/>
                    <circle cx="14" cy="14" r="8" stroke={rgba(color, 0.25)} strokeWidth="0.8"/>
                    <path d="M14 4l2 8-2 1-2-1z" fill={color} opacity="0.8"/>
                    <path d="M14 24l-2-8 2-1 2 1z" fill={rgba(color, 0.35)}/>
                    <circle cx="14" cy="14" r="2" fill={color} opacity="0.7"/>
                    {(["N","E","S","W"] as const).map((d, i) => (
                      <text key={d} x={14 + (i===1?10:i===3?-10:0)} y={14 + (i===0?-5:i===2?8:2.5)} textAnchor="middle" fill={rgba(color, 0.6)} fontSize="4.5" fontFamily="Georgia,serif">{d}</text>
                    ))}
                  </svg>
                  <div>
                    <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.22em", textTransform: "uppercase", lineHeight: 1 }}>Ship's Log</p>
                    <p style={{ fontSize: 11, color: inkMid, fontStyle: "italic", lineHeight: 1.4 }}>{profile.eraName}</p>
                  </div>
                  <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right, rgba(80,45,10,0.25), transparent)` }} />
                </div>

                <FadeLines rm={rm} baseDelay={0.15} lines={[

                  /* Port of record */
                  <div key="port" style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 3 }}>Port of Record</p>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: inkDark, fontFamily: "'Crimson Pro', Georgia, serif", letterSpacing: "0.02em", lineHeight: 1.15 }}>{profile.worldName}</h2>
                  </div>,

                  /* Divider with crossed anchors */
                  <div key="div" style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 18px" }}>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(80,45,10,0.2)" }} />
                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                      <line x1="0" y1="6" x2="18" y2="6" stroke={rgba(color, 0.45)} strokeWidth="1"/>
                      <circle cx="5" cy="6" r="2.5" fill={rgba(color, 0.2)} stroke={rgba(color, 0.45)} strokeWidth="0.8"/>
                      <circle cx="13" cy="6" r="2.5" fill={rgba(color, 0.2)} stroke={rgba(color, 0.45)} strokeWidth="0.8"/>
                    </svg>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(80,45,10,0.2)" }} />
                  </div>,

                  /* Log entry body — gruff voice */
                  <p key="entry" style={{ fontSize: 15, color: inkMid, lineHeight: 1.85, marginBottom: 20, fontStyle: "italic" }}>
                    These waters do not forgive the weak nor forget the bold. Every name that has ever mattered was written first in salt and blood before it ever reached parchment.
                  </p>,

                  /* Name manifest — stamped look */
                  <div key="name" style={{
                    background: "rgba(80,45,10,0.07)",
                    border: `1px solid rgba(80,45,10,0.18)`,
                    borderLeft: `3px solid ${rgba(color, 0.6)}`,
                    borderRadius: 3, padding: "14px 16px", marginBottom: 16,
                    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                    <p style={{ fontSize: 9, color: inkFade, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Crew Manifest — Recorded Soul</p>
                    <p style={{ fontSize: 23, fontWeight: 700, color: inkDark, letterSpacing: "0.01em", lineHeight: 1.2 }}>{profile.alternativeName}</p>
                    <p style={{ fontSize: 13, color: inkFade, fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
                  </div>,

                  /* Sign-off — gruff, salt-worn */
                  <p key="signoff" style={{ fontSize: 13, color: inkFade, fontStyle: "italic", lineHeight: 1.75 }}>
                    The sea does not ask if you are ready. She only asks if you are coming.
                  </p>,
                ]} />

                {/* CTA — branded like a port stamp */}
                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={onDismiss}
                    autoFocus
                    style={{
                      width: "100%", padding: "13px 0", cursor: "pointer",
                      background: inkDark,
                      color: logPaper,
                      border: `1px solid rgba(80,45,10,0.4)`,
                      borderRadius: 3, fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.16em", textTransform: "uppercase",
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      minHeight: 48, touchAction: "manipulation",
                      boxShadow: `0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,200,80,0.06)`,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    All Hands on Deck
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── DRAGON — carved stone tablet, skeuomorphic depth ─────────────────────────
function DragonArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const embers = Array.from({ length: 12 }, (_, i) => i);

  // Stone palette
  const stoneBase  = "#18141f";
  const _stoneMid  = "#211c2c"; void _stoneMid;
  const stoneDust  = "#b8a8d0";   // carved text colour — light stone dust
  const stoneFade  = "#7a6898";   // secondary carved text
  const stoneFaint = "#4a3e62";   // very muted

  return (
    <motion.div
      initial={rm ? false : { y: 44, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 520, width: "100%", position: "relative",
      // Skeuomorphic stone slab: bevelled edges via multi-layer shadow
      background: [
        // Stone grain layers (8-stop gradient)
        `repeating-linear-gradient(13deg, transparent, transparent 4px, rgba(255,255,255,0.008) 4px, rgba(255,255,255,0.008) 5px)`,
        `repeating-linear-gradient(97deg, transparent, transparent 6px, rgba(0,0,0,0.015) 6px, rgba(0,0,0,0.015) 7px)`,
        `linear-gradient(155deg, #1e1829 0%, ${stoneBase} 35%, #130f1c 65%, #1c1828 100%)`,
      ].join(", "),
      borderRadius: 6,   // stone has sharp corners
      border: `1px solid ${rgba(color, 0.15)}`,
      boxShadow: [
        // Outer depth
        "0 32px 80px rgba(0,0,0,0.95)",
        "0 8px 24px rgba(0,0,0,0.7)",
        // Bevel top-left highlight
        `inset 0 1px 0 rgba(200,160,255,0.07)`,
        `inset 1px 0 0 rgba(200,160,255,0.04)`,
        // Bevel bottom-right shadow
        `inset 0 -2px 0 rgba(0,0,0,0.7)`,
        `inset -2px 0 0 rgba(0,0,0,0.5)`,
        // Inner ambient glow from rune
        `inset 0 0 60px ${rgba(color, 0.05)}`,
      ].join(", "),
    }}>

      {/* Floating energy particles — keep these */}
      {!rm && embers.map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
            borderRadius: "50%", background: i % 2 === 0 ? color : rgba(color, 0.5),
            left: `${10 + (i * 73) % 80}%`, bottom: 0, pointerEvents: "none", zIndex: 0,
            boxShadow: `0 0 4px ${rgba(color, 0.6)}`,
          }}
          animate={{ y: [0, -(80 + (i * 37) % 160)], opacity: [0, 0.9, 0], x: [i % 2 ? 5 : -5] }}
          transition={{ duration: 2.2 + (i * 0.3) % 2, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* Corner rune marks */}
      {[
        { top: 10, left: 10 }, { top: 10, right: 10 },
        { bottom: 10, left: 10 }, { bottom: 10, right: 10 },
      ].map((pos, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ position: "absolute", ...pos, opacity: 0.25, pointerEvents: "none" }}>
          <path d="M7 1v12M1 7h12M3 3l8 8M11 3l-8 8" stroke={color} strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      ))}

      {/* Carved horizontal rule at top */}
      <div style={{
        margin: "0 24px",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${rgba(color, 0.3)} 30%, ${rgba(color, 0.5)} 50%, ${rgba(color, 0.3)} 70%, transparent)`,
        boxShadow: `0 1px 0 rgba(0,0,0,0.6)`,
      }} />

      <div style={{ padding: "28px 32px 28px", position: "relative", zIndex: 1, fontFamily: "'Cinzel', Georgia, serif" }}>

        {/* Central rune glyph — glowing from within the stone */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <motion.svg width="64" height="64" viewBox="0 0 60 60" fill="none"
            animate={rm ? {} : { filter: [
              `drop-shadow(0 0 3px ${rgba(color, 0.4)}) drop-shadow(0 0 8px ${rgba(color, 0.2)})`,
              `drop-shadow(0 0 8px ${rgba(color, 0.8)}) drop-shadow(0 0 20px ${rgba(color, 0.4)})`,
              `drop-shadow(0 0 3px ${rgba(color, 0.4)}) drop-shadow(0 0 8px ${rgba(color, 0.2)})`,
            ]}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer triangle — worn/thick like carved stone */}
            <polygon points="30,3 57,50 3,50" stroke={rgba(color, 0.35)} strokeWidth="2" fill={rgba(color, 0.04)} />
            {/* Inner triangle */}
            <polygon points="30,11 51,46 9,46" stroke={rgba(color, 0.2)} strokeWidth="1.2" fill="none" />
            {/* Central rune strokes */}
            <path d="M30 17v20M21 37l9-20 9 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Centre node */}
            <circle cx="30" cy="30" r="2.5" fill={color} />
            {/* Worn crack marks */}
            <path d="M14 44 l3-5M46 44 l-3-5" stroke={rgba(color, 0.15)} strokeWidth="0.8" strokeLinecap="round"/>
          </motion.svg>
        </div>

        {/* "ANCIENT INSCRIPTION" header — looks carved, all caps */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 1, background: `linear-gradient(to right, transparent, ${rgba(color, 0.4)})` }} />
            <span style={{
              fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase",
              color: stoneFaint, fontFamily: "'Cinzel', serif",
              textShadow: `0 1px 0 rgba(0,0,0,0.8)`,
            }}>Ancient Inscription</span>
            <div style={{ width: 28, height: 1, background: `linear-gradient(to left, transparent, ${rgba(color, 0.4)})` }} />
          </div>
        </div>

        <FadeLines rm={rm} baseDelay={0.15} lines={[

          // World name — large carved heading
          <div key="world" style={{ textAlign: "center", marginBottom: 18 }}>
            <h2 style={{
              fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.1em",
              color: stoneDust, fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              // Carved text: depth shadow below, faint glow above
              textShadow: `0 2px 4px rgba(0,0,0,0.9), 0 -1px 0 rgba(0,0,0,0.6), 0 0 16px ${rgba(color, 0.25)}`,
              marginBottom: 6,
            }}>
              {profile.worldName}
            </h2>
            {/* Carved divider line */}
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${rgba(color, 0.25)} 30%, ${rgba(color, 0.4)} 50%, ${rgba(color, 0.25)} 70%, transparent)`, marginBottom: 6 }} />
            <p style={{
              fontSize: 12, color: stoneFade, letterSpacing: "0.12em", fontStyle: "italic",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}>{profile.eraName}</p>
          </div>,

          // Body text — carved prose
          <p key="lore" style={{
            fontSize: 13.5, color: stoneFade, lineHeight: 1.85, marginBottom: 20,
            textShadow: "0 1px 2px rgba(0,0,0,0.7)",
            letterSpacing: "0.02em",
          }}>
            Here hath power been measured in centuries, not years. Knowledge is hard-earned. Dragonfire endures long after the hand that struck the first flame has turned to dust.
          </p>,

          // Name plate — recessed stone carving within the tablet
          <div key="name" style={{
            // Recessed/inset look — darker inset, bevelled edges
            background: `linear-gradient(160deg, #100d18 0%, #0e0b15 100%)`,
            borderRadius: 4,
            padding: "16px 18px",
            boxShadow: [
              "inset 0 2px 6px rgba(0,0,0,0.8)",
              "inset 0 -1px 0 rgba(255,255,255,0.04)",
              `inset 0 0 20px rgba(0,0,0,0.4)`,
              `0 1px 0 ${rgba(color, 0.12)}`,
            ].join(", "),
            border: `1px solid ${rgba(color, 0.12)}`,
            marginBottom: 4,
          }}>
            <p style={{
              fontSize: 9, color: stoneFaint, letterSpacing: "0.22em", textTransform: "uppercase",
              marginBottom: 10, fontFamily: "'Cinzel', serif",
              textShadow: "0 1px 0 rgba(0,0,0,0.9)",
            }}>
              Thy name is carved upon these stones
            </p>
            <p style={{
              fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.2,
              color: stoneDust,
              textShadow: `0 2px 3px rgba(0,0,0,0.9), 0 0 12px ${rgba(color, 0.3)}`,
              fontFamily: "'Cinzel', Georgia, serif",
            }}>
              {profile.alternativeName}
            </p>
            <p style={{
              fontSize: 12, color: stoneFade, fontStyle: "italic", marginTop: 6,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}>
              {profile.profession}
            </p>
          </div>,
        ]} />

        {/* Carved bottom rule */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${rgba(color, 0.2)} 40%, ${rgba(color, 0.2)} 60%, transparent)`, margin: "20px 0 24px", boxShadow: "0 1px 0 rgba(0,0,0,0.6)" }} />

        <button
          onClick={onDismiss}
          autoFocus
          style={{
            width: "100%", padding: "13px 0", cursor: "pointer",
            background: `linear-gradient(160deg, #2a1f3e 0%, #1a1228 100%)`,
            color: stoneDust, border: `1px solid ${rgba(color, 0.35)}`,
            borderRadius: 4, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            fontFamily: "'Cinzel', Georgia, serif",
            minHeight: 48, touchAction: "manipulation",
            boxShadow: `0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 ${rgba(color, 0.12)}, 0 0 0 1px rgba(0,0,0,0.4)`,
            textShadow: `0 0 10px ${rgba(color, 0.5)}`,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Enter the Dominion
        </button>
      </div>

      {/* Carved horizontal rule at bottom */}
      <div style={{
        margin: "0 24px",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${rgba(color, 0.3)} 30%, ${rgba(color, 0.5)} 50%, ${rgba(color, 0.3)} 70%, transparent)`,
        boxShadow: "0 -1px 0 rgba(0,0,0,0.6)",
      }} />
    </motion.div>
  );
}

// ── GALACTIC ──────────────────────────────────────────────────────────────────
function GalacticArrival({ profile, onDismiss, rm, color }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  const stars = Array.from({ length: 30 }, (_, i) => i);
  return (
    <ArrivalShell color={color}>
      {/* Static-resolves-to-signal entrance */}
      {!rm && (
        <>
          {/* Static noise overlay — fades out */}
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0, zIndex: 12, borderRadius: 20, pointerEvents: "none",
              background: [
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)",
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, transparent 1px, transparent 4px)",
                `radial-gradient(ellipse at 50% 50%, rgba(124,110,247,0.08) 0%, rgba(0,0,0,0.85) 100%)`,
              ].join(", "),
            }}
          />
          {/* Scanline sweep — single pass */}
          <motion.div
            initial={{ top: "-5%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 0.55, delay: 0.5, ease: "easeIn" }}
            style={{
              position: "absolute", left: 0, right: 0, height: "18%", zIndex: 13,
              background: `linear-gradient(180deg, transparent 0%, ${rgba(color, 0.08)} 50%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />
        </>
      )}
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

// ── VAMPIRE — Moonlit Manuscript ─────────────────────────────────────────────
function VampireArrival({ profile, onDismiss, rm }: {
  profile: AlternateProfile; onDismiss: () => void; rm: boolean; color: string;
}) {
  // Manuscript palette — override universe red; use moonlit silver/night tones
  const moonSilver = "#e8e2f8";   // primary text — silver-cream
  const moonFade   = "#c8b8e8";   // secondary
  const moonMuted  = "#8878a8";   // muted labels
  const inkRed     = "#E31937";   // sparse accent — pen/ink only
  const parchment  = "#0f0d14";   // aged night paper
  const parchmentMid = "#13101a"; // slightly lighter

  const motes = Array.from({ length: 22 }, (_, i) => i);

  return (
    /* Entrance: fades from complete void — slow 1.2s */
    <motion.div
      initial={rm ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{ maxWidth: 520, width: "100%" }}
    >
      {/* Manuscript outer container — aged paper, sharp corners */}
      <div style={{
        background: `linear-gradient(170deg, ${parchment} 0%, ${parchmentMid} 50%, ${parchment} 100%)`,
        borderRadius: 4,
        border: "1px solid rgba(200,190,240,0.09)",
        boxShadow: [
          "0 40px 100px rgba(0,0,0,0.98)",
          "0 8px 32px rgba(0,0,0,0.8)",
          "inset 0 0 80px rgba(0,0,0,0.35)",
          "inset 0 0 120px rgba(120,100,200,0.04)",
        ].join(", "),
        position: "relative", overflow: "hidden",
      }}>

        {/* Moonlight — radial glow from top center, like moonlight through window */}
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 480, height: 360, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(210,200,255,0.14) 0%, rgba(160,148,240,0.07) 40%, transparent 68%)",
        }} />

        {/* Aged paper grain texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: [
            "repeating-linear-gradient(14deg, transparent, transparent 9px, rgba(180,160,255,0.012) 9px, rgba(180,160,255,0.012) 10px)",
            "repeating-linear-gradient(94deg, transparent, transparent 14px, rgba(0,0,0,0.018) 14px, rgba(0,0,0,0.018) 15px)",
          ].join(", "),
        }} />

        {/* Page edge vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)",
        }} />

        {/* Silvery dust motes — float slowly */}
        {!rm && motes.map(i => (
          <motion.div key={i}
            style={{
              position: "absolute",
              width: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
              height: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
              borderRadius: "50%",
              background: i % 4 === 0 ? "rgba(230,220,255,0.95)" : i % 3 === 0 ? "rgba(190,178,250,0.7)" : "rgba(160,148,230,0.5)",
              left: `${(i * 43 + 6) % 90}%`,
              top: `${(i * 67 + 4) % 92}%`,
              pointerEvents: "none",
              boxShadow: "0 0 4px rgba(200,188,255,0.35)",
            }}
            animate={{
              y: [0, -(5 + i % 9), 0],
              opacity: [0.08, 0.65, 0.08],
              x: [0, i % 2 ? 4 : -4, 0],
            }}
            transition={{ duration: 5 + (i % 6), delay: i * 0.38, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Red ink splatter — sparse decoration, top corners only */}
        <svg style={{ position: "absolute", top: 14, left: 14, opacity: 0.22, pointerEvents: "none" }} width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="7" cy="7" r="2.2" fill={inkRed} />
          <circle cx="13" cy="5" r="1.3" fill={inkRed} />
          <circle cx="5" cy="13" r="1" fill={inkRed} />
          <line x1="7" y1="7" x2="13" y2="5" stroke={inkRed} strokeWidth="0.5" opacity="0.5" />
          <circle cx="19" cy="4" r="0.8" fill={inkRed} opacity="0.6" />
        </svg>
        <svg style={{ position: "absolute", top: 14, right: 14, opacity: 0.15, pointerEvents: "none", transform: "scaleX(-1)" }} width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="7" cy="7" r="1.8" fill={inkRed} />
          <circle cx="14" cy="5" r="1" fill={inkRed} />
          <line x1="7" y1="7" x2="14" y2="5" stroke={inkRed} strokeWidth="0.4" opacity="0.5" />
        </svg>

        {/* Content */}
        <div style={{ padding: "34px 40px 30px", position: "relative", zIndex: 1, fontFamily: "'Crimson Pro', Georgia, serif" }}>

          {/* Manuscript header */}
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: "0.5px", background: "linear-gradient(to right, transparent, rgba(200,190,240,0.25))" }} />
              <span style={{ fontSize: 9, color: moonMuted, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>Moonlit Manuscript</span>
              <div style={{ width: 34, height: "0.5px", background: "linear-gradient(to left, transparent, rgba(200,190,240,0.25))" }} />
            </div>
            {/* Thin red pen-stroke underline */}
            <div style={{ height: "0.5px", background: `linear-gradient(90deg, transparent, ${inkRed}55, transparent)`, maxWidth: 200, margin: "0 auto" }} />
          </div>

          {/* World name — fades in after void entrance */}
          <div style={{ marginBottom: 20 }}>
            <motion.p
              initial={rm ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rm ? 0 : 0.4, duration: 0.9 }}
              style={{ fontSize: 10, color: moonMuted, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Cinzel', serif" }}
            >
              The realm recorded herein
            </motion.p>
            <motion.h2
              initial={rm ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rm ? 0 : 0.55, duration: 1.1 }}
              style={{ fontSize: 28, fontWeight: 700, color: moonSilver, letterSpacing: "0.04em", lineHeight: 1.2, fontStyle: "italic", marginBottom: 6 }}
            >
              {profile.worldName}
            </motion.h2>
            <motion.p
              initial={rm ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rm ? 0 : 0.75, duration: 0.9 }}
              style={{ fontSize: 13, color: moonFade, fontStyle: "italic" }}
            >
              {profile.eraName}
            </motion.p>
          </div>

          {/* Thin red divider line */}
          <motion.div
            initial={rm ? false : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: rm ? 0 : 0.9, duration: 0.6, ease: "easeOut" }}
            style={{ height: "0.5px", background: `linear-gradient(90deg, transparent, ${inkRed}45 30%, ${inkRed}45 70%, transparent)`, margin: "16px 0", transformOrigin: "left" }}
          />

          {/* Body text — word-by-word whisper */}
          <div style={{ marginBottom: 22 }}>
            <WhisperText
              text="In this world, memories are older than the stones they are carved upon. Secrets endure longer than the immortal hands that keep them. The night does not end — it only deepens."
              delay={rm ? 0 : 1.0}
              rm={rm}
              style={{ fontSize: 15.5, color: moonFade, lineHeight: 1.92, fontStyle: "italic", display: "block" }}
            />
          </div>

          {/* Name plate — aged vellum inset */}
          <motion.div
            initial={rm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rm ? 0 : 2.0, duration: 0.9 }}
            style={{
              background: "rgba(18,14,26,0.7)",
              border: "1px solid rgba(200,190,240,0.09)",
              borderLeft: `2px solid ${inkRed}55`,
              borderRadius: 3,
              padding: "16px 18px",
              boxShadow: "inset 0 1px 8px rgba(0,0,0,0.55)",
              marginBottom: 4,
            }}
          >
            <p style={{ fontSize: 9, color: moonMuted, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Cinzel', serif" }}>
              The one written into these pages
            </p>
            <p style={{ fontSize: 23, fontWeight: 700, color: moonSilver, fontStyle: "italic", letterSpacing: "0.03em", lineHeight: 1.2 }}>
              {profile.alternativeName}
            </p>
            <p style={{ fontSize: 13, color: moonFade, fontStyle: "italic", marginTop: 6 }}>
              {profile.profession}
            </p>
          </motion.div>

          {/* Closing line */}
          <motion.p
            initial={rm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rm ? 0 : 2.5, duration: 1.1 }}
            style={{ fontSize: 13, color: moonMuted, fontStyle: "italic", lineHeight: 1.75, marginTop: 18, textAlign: "center" }}
          >
            Turn the page. The story does not end.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={rm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rm ? 0 : 2.8, duration: 0.8 }}
            style={{ marginTop: 28 }}
          >
            <button
              onClick={onDismiss}
              autoFocus
              style={{
                width: "100%", padding: "13px 0", cursor: "pointer",
                background: "rgba(18,14,26,0.92)",
                color: moonSilver,
                border: "1px solid rgba(200,190,240,0.14)",
                borderRadius: 3, fontSize: 12, fontWeight: 400,
                letterSpacing: "0.26em", textTransform: "uppercase",
                fontFamily: "'Cinzel', Georgia, serif",
                minHeight: 48, touchAction: "manipulation",
                boxShadow: "0 4px 20px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.25)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Open the Manuscript
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
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
  // color is used by ArrivalContent (each component receives it as a prop)

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
          exit={rm ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: rm ? 0.1 : 0.3, ease: "easeIn" }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <ArrivalContent profile={profile} onDismiss={onDismiss} rm={rm} color={color} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
