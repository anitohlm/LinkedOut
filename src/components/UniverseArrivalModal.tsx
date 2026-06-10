"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlternateProfile, UniverseType } from "@/types";

interface Props {
  universeId: UniverseType;
  profile: AlternateProfile;
  onDismiss: () => void;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function FadeLines({ lines, rm, baseDelay = 0, style }: {
  lines: React.ReactNode[];
  rm: boolean;
  baseDelay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={rm ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rm ? 0 : baseDelay + i * 0.18, duration: 0.45, ease: "easeOut" }}
          style={style}
        >
          {line}
        </motion.div>
      ))}
    </>
  );
}

function ArrivalButtons({ primary, secondary, onDismiss, primaryColor, textColor = "#fff" }: {
  primary: string;
  secondary: string;
  onDismiss: () => void;
  primaryColor: string;
  textColor?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
      <button
        onClick={onDismiss}
        autoFocus
        style={{
          flex: 1, padding: "14px 0", borderRadius: 12, cursor: "pointer", border: "none",
          background: primaryColor, color: textColor,
          fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
          fontFamily: "inherit", minHeight: 48, touchAction: "manipulation",
          boxShadow: `0 8px 24px -8px ${primaryColor}88`,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        {primary}
      </button>
      <button
        onClick={onDismiss}
        style={{
          padding: "14px 20px", borderRadius: 12, cursor: "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: "inherit",
          minHeight: 48, touchAction: "manipulation", transition: "color 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
      >
        {secondary}
      </button>
    </div>
  );
}

// ── MEDIEVAL ──────────────────────────────────────────────────────────────────
function MedievalArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  const [sealBroken, setSealBroken] = useState(rm);

  return (
    <div style={{
      background: "linear-gradient(160deg, #1a1408 0%, #0f0c05 60%, #1a1005 100%)",
      border: "1px solid #a07c3044",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #a07c3020, inset 0 1px 0 #a07c3028",
      position: "relative",
    }}>
      {/* Parchment texture overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)",
      }} />
      {/* Gold top line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #c9a845cc, transparent 95%)" }} />

      <div style={{ padding: "36px 36px 32px", fontFamily: "'Crimson Pro', Georgia, serif", position: "relative" }}>

        {/* Seal */}
        <AnimatePresence mode="wait">
          {!sealBroken ? (
            <motion.div
              key="seal"
              initial={rm ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={rm ? {} : { scale: 1.2, opacity: 0, rotate: 15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 20px" }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, #c9a845, #8b6914)",
                border: "3px solid #c9a84588", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px #c9a84544, inset 0 2px 4px rgba(255,255,255,0.2)",
                cursor: "pointer", position: "relative",
              }}
                onClick={() => setSealBroken(true)}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z" fill="#1a1408" stroke="#1a1408" strokeWidth="0.5"/>
                  <circle cx="12" cy="12" r="10" stroke="#1a1408" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <p style={{ fontSize: 12, color: "#c9a84566", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 14, fontFamily: "Sora, sans-serif" }}>
                Break the Royal Seal to proceed
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={rm ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Eyebrow */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84577", marginBottom: 18, fontFamily: "Sora, sans-serif" }}>
                Royal Proclamation
              </p>

              <FadeLines rm={rm} baseDelay={0.1} lines={[
                <p style={{ fontSize: 15, color: "#d4b96a", fontStyle: "italic", marginBottom: 20, lineHeight: 1.7 }}>
                  Traveler,
                </p>,
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "#a07c3066", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "Sora, sans-serif" }}>You have arrived in</p>
                  <h2 style={{ fontSize: 26, fontWeight: 700, color: "#e8d48a", letterSpacing: "0.06em", lineHeight: 1.2 }}>
                    {profile.worldName}
                  </h2>
                </div>,
                <div style={{ marginBottom: 20, paddingLeft: 16, borderLeft: "2px solid #c9a84533" }}>
                  <p style={{ fontSize: 11, color: "#a07c3066", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "Sora, sans-serif" }}>Era</p>
                  <p style={{ fontSize: 16, color: "#c9a845aa", fontStyle: "italic" }}>{profile.eraName}</p>
                </div>,
                <p style={{ fontSize: 15, color: "rgba(220,195,140,0.7)", lineHeight: 1.75, marginBottom: 20 }}>
                  This realm values honor, loyalty, and service. The history of {profile.worldName} is still being written.
                </p>,
                <div style={{ background: "rgba(201,168,69,0.07)", border: "1px solid #c9a84522", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontSize: 11, color: "#a07c3066", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora, sans-serif" }}>In this reality, you are known as</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "#e8d48a", letterSpacing: "0.04em" }}>{profile.alternativeName}</p>
                  <p style={{ fontSize: 14, color: "#c9a845aa", fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
                </div>,
                <p style={{ fontSize: 14, color: "rgba(220,195,140,0.5)", fontStyle: "italic", lineHeight: 1.7, marginTop: 20 }}>
                  Your choices may become part of that story.
                </p>,
              ]} />

              <ArrivalButtons primary="Enter Eldoria" secondary="Break the Seal" onDismiss={onDismiss} primaryColor="#c9a845" textColor="#0f0c05" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── CYBERPUNK ─────────────────────────────────────────────────────────────────
function TypewriterLine({ text, delay, rm, style }: { text: string; delay: number; rm: boolean; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState(rm ? text : "");
  useEffect(() => {
    if (rm) return;
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, ++i));
        if (i >= text.length) clearInterval(interval);
      }, 28);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, delay, rm]);
  return <div style={style}>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0, color: "#00ff9d" }}>█</span></div>;
}

function CyberpunkArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  return (
    <div style={{
      background: "#030609",
      border: "1px solid #00ff9d22",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #00ff9d10",
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      position: "relative",
    }}>
      {/* Scan line */}
      {!rm && (
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", left: 0, right: 0, height: 2, zIndex: 5,
            background: "linear-gradient(90deg, transparent, #00ff9d22, transparent)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Green top line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #00ff9dcc, transparent 95%)" }} />

      <div style={{ padding: "32px 36px 28px", position: "relative" }}>
        <TypewriterLine text="// INITIALIZING CONNECTION..." delay={0} rm={rm}
          style={{ fontSize: 11, color: "#00ff9d66", marginBottom: 24, letterSpacing: "0.06em" }} />

        <FadeLines rm={rm} baseDelay={0.8} lines={[
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: "#00ff9d44", letterSpacing: "0.14em", marginBottom: 4 }}>// IDENTITY DETECTED</p>
            <div style={{ fontSize: 11, color: "#00ff9d55", marginBottom: 8 }}>USER:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#00ff9d", letterSpacing: "0.08em", textShadow: "0 0 16px #00ff9d88" }}>
              {profile.alternativeName}
            </div>
            <div style={{ fontSize: 13, color: "#00ff9d77", marginTop: 6 }}>{profile.profession}</div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#00ff9d55", marginBottom: 4 }}>LOCATION:</div>
            <div style={{ fontSize: 16, color: "#7cffd4", letterSpacing: "0.06em" }}>{profile.worldName}</div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#00ff9d55", marginBottom: 4 }}>ERA:</div>
            <div style={{ fontSize: 16, color: "#7cffd4", letterSpacing: "0.06em" }}>{profile.eraName}</div>
          </div>,
          <div style={{ height: 1, background: "#00ff9d14", margin: "4px 0 20px" }} />,
          <p style={{ fontSize: 13, color: "#00ff9d88", lineHeight: 1.75 }}>
            In this reality, memories, knowledge, and experiences are preserved within the Grid.
            Your alternate self shapes what humanity remembers — and what it forgets.
          </p>,
          <TypewriterLine text="// CONNECTION ESTABLISHED. WELCOME." delay={0} rm={rm}
            style={{ fontSize: 11, color: "#00ff9d", marginTop: 20, letterSpacing: "0.06em" }} />,
        ]} />

        <ArrivalButtons primary="ACCESS GRID" secondary="CONTINUE" onDismiss={onDismiss} primaryColor="#00ff9d" textColor="#030609" />
      </div>
    </div>
  );
}

// ── PIRATE ────────────────────────────────────────────────────────────────────
function PirateArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0d1117 0%, #0a0e14 60%, #0d1018 100%)",
      border: "1px solid #d4844044",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #d4844018",
      fontFamily: "'Sora', sans-serif",
      position: "relative",
    }}>
      {/* Ocean shimmer */}
      {!rm && (
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,132,64,0.05) 20px, rgba(212,132,64,0.05) 21px)",
          }}
        />
      )}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #d48440cc, transparent 95%)" }} />

      <div style={{ padding: "36px 36px 28px", position: "relative" }}>
        {/* Compass decoration */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.div
            animate={rm ? {} : { rotate: [0, 5, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="24" stroke="#d4844044" strokeWidth="1.5" />
              <circle cx="26" cy="26" r="18" stroke="#d4844022" strokeWidth="1" />
              <path d="M26 8l3 16-3 2-3-2z" fill="#d48440" />
              <path d="M26 44l-3-16 3-2 3 2z" fill="#5a6070" />
              <circle cx="26" cy="26" r="3" fill="#d48440" />
              {["N","E","S","W"].map((d, i) => (
                <text key={d} x={26 + (i===1?19:i===3?-19:0)} y={26 + (i===0?-12:i===2?16:4)} textAnchor="middle" fill="#d4844088" fontSize="8" fontFamily="Sora,sans-serif">{d}</text>
              ))}
            </svg>
          </motion.div>
        </div>

        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 12, color: "#d4844066", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic" }}>
            Captain's Log
          </p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#e8a870", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 6 }}>
              {profile.worldName}
            </h2>
            <p style={{ fontSize: 14, color: "#d4844077", fontStyle: "italic" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: "rgba(220,175,130,0.75)", lineHeight: 1.75, marginBottom: 20 }}>
            The seas connect hundreds of islands, cultures, and stories. Those who master the tides shape the future of entire nations.
          </p>,
          <div style={{ background: "rgba(212,132,64,0.07)", border: "1px solid #d4844022", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#d4844055", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Your name is known among navigators
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#e8a870", letterSpacing: "-0.2px" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: "#d48440aa", fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 14, color: "rgba(220,175,130,0.5)", fontStyle: "italic", lineHeight: 1.7 }}>
            May favorable winds guide your journey.
          </p>,
        ]} />

        <ArrivalButtons primary="Set Sail" secondary="Open Logbook" onDismiss={onDismiss} primaryColor="#d48440" textColor="#0d1117" />
      </div>
    </div>
  );
}

// ── DRAGON ────────────────────────────────────────────────────────────────────
function DragonArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  const embers = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div style={{
      background: "linear-gradient(160deg, #120800 0%, #0d0500 60%, #150900 100%)",
      border: "1px solid #e0601044",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #e0601018",
      fontFamily: "'Cinzel', Georgia, serif",
      position: "relative",
    }}>
      {/* Ember particles */}
      {!rm && embers.map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", width: 2, height: 2, borderRadius: "50%",
            background: i % 3 === 0 ? "#e06010" : i % 3 === 1 ? "#ff8c00" : "#ffd700",
            left: `${10 + (i * 73) % 80}%`, bottom: 0,
            pointerEvents: "none", zIndex: 0,
          }}
          animate={{ y: [0, -(80 + (i * 37) % 160)], opacity: [0, 0.8, 0], x: [(i % 2 ? 4 : -4)] }}
          transition={{ duration: 2 + (i * 0.3) % 2, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #e06010cc, transparent 95%)" }} />

      <div style={{ padding: "36px 36px 28px", position: "relative", zIndex: 1 }}>
        {/* Rune glyph */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.svg width="60" height="60" viewBox="0 0 60 60" fill="none"
            animate={rm ? {} : { filter: ["drop-shadow(0 0 4px #e0601044)", "drop-shadow(0 0 12px #e06010aa)", "drop-shadow(0 0 4px #e0601044)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <polygon points="30,4 56,48 4,48" stroke="#e0601055" strokeWidth="1.5" fill="none" />
            <polygon points="30,12 50,44 10,44" stroke="#e0601033" strokeWidth="1" fill="none" />
            <path d="M30 18v18M22 36l8-18 8 18" stroke="#e06010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="30" cy="30" r="3" fill="#e06010" style={{ filter: "drop-shadow(0 0 4px #e06010)" }} />
          </motion.svg>
        </div>

        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 11, color: "#e0601055", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16, fontFamily: "Sora,sans-serif" }}>
            Ancient Inscription
          </p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#ff8c44", letterSpacing: "0.08em", lineHeight: 1.2, marginBottom: 6 }}>
              {profile.worldName}
            </h2>
            <p style={{ fontSize: 14, color: "#e0601077", letterSpacing: "0.06em" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: "rgba(240,160,80,0.7)", lineHeight: 1.8, marginBottom: 20 }}>
            This land is shaped by dragons, ancient wisdom, and elemental power.
            Knowledge is earned. Power is respected. Legacy is remembered.
          </p>,
          <div style={{ background: "rgba(224,96,16,0.07)", border: "1px solid #e0601022", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#e0601055", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora,sans-serif" }}>
              Your deeds are part of this living history
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#ff8c44", letterSpacing: "0.04em" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: "#e06010aa", fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
        ]} />

        <ArrivalButtons primary="Enter the Dominion" secondary="Follow the Runes" onDismiss={onDismiss} primaryColor="#e06010" textColor="#120800" />
      </div>
    </div>
  );
}

// ── GALACTIC ──────────────────────────────────────────────────────────────────
function GalacticArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  const stars = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div style={{
      background: "linear-gradient(160deg, #020510 0%, #010308 60%, #020714 100%)",
      border: "1px solid #4af0d044",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #4af0d010",
      fontFamily: "'Exo 2', 'Sora', sans-serif",
      position: "relative",
    }}>
      {/* Star field */}
      {!rm && stars.map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", width: 1.5, height: 1.5, borderRadius: "50%",
            background: "#fff", opacity: 0.3,
            left: `${(i * 37 + 5) % 95}%`, top: `${(i * 53 + 3) % 90}%`,
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2 + (i % 3), delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #4af0d0cc, transparent 95%)" }} />

      <div style={{ padding: "32px 36px 28px", position: "relative", zIndex: 1 }}>
        {/* Transmission header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
          padding: "8px 14px", borderRadius: 8,
          background: "rgba(74,240,208,0.06)", border: "1px solid rgba(74,240,208,0.15)",
        }}>
          <motion.div
            animate={rm ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#4af0d0", flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: "#4af0d0aa", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Interstellar Transmission Incoming
          </span>
        </div>

        <FadeLines rm={rm} baseDelay={0.3} lines={[
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: "#4af0d055", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>TRAVELER DETECTED</p>
            <div style={{ fontSize: 11, color: "#4af0d055", marginBottom: 4 }}>LOCATION:</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#4af0d0", letterSpacing: "0.06em", textShadow: "0 0 20px #4af0d044" }}>
              {profile.worldName}
            </div>
          </div>,
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#4af0d055", marginBottom: 4 }}>ERA:</div>
            <div style={{ fontSize: 15, color: "#7cfde8", letterSpacing: "0.06em" }}>{profile.eraName}</div>
          </div>,
          <p style={{ fontSize: 14, color: "rgba(124,253,232,0.65)", lineHeight: 1.75, marginBottom: 20 }}>
            Humanity has expanded beyond Earth. New colonies, distant systems, and unexplored frontiers await discovery.
          </p>,
          <div style={{ background: "rgba(74,240,208,0.06)", border: "1px solid #4af0d022", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#4af0d055", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Your alternate self stands among the frontier
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#4af0d0", letterSpacing: "0.06em", textShadow: "0 0 12px #4af0d033" }}>
              {profile.alternativeName}
            </p>
            <p style={{ fontSize: 14, color: "#4af0d099", marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 13, color: "rgba(74,240,208,0.5)", letterSpacing: "0.06em", marginTop: 16, textTransform: "uppercase" }}>
            Exploration begins now.
          </p>,
        ]} />

        <ArrivalButtons primary="Begin Mission" secondary="View Star Charts" onDismiss={onDismiss} primaryColor="#4af0d0" textColor="#020510" />
      </div>
    </div>
  );
}

// ── VAMPIRE ───────────────────────────────────────────────────────────────────
function VampireArrival({ profile, onDismiss, rm }: { profile: AlternateProfile; onDismiss: () => void; rm: boolean }) {
  const particles = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div style={{
      background: "linear-gradient(160deg, #090510 0%, #060308 60%, #0a0414 100%)",
      border: "1px solid #9060c044",
      borderRadius: 20, overflow: "hidden", maxWidth: 520, width: "100%",
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px #9060c018",
      fontFamily: "'Crimson Pro', Georgia, serif",
      position: "relative",
    }}>
      {/* Floating particles */}
      {!rm && particles.map(i => (
        <motion.div key={i}
          style={{
            position: "absolute", width: 2, height: 2, borderRadius: "50%",
            background: i % 2 === 0 ? "#9060c0" : "#c090ff",
            left: `${(i * 59 + 8) % 90}%`,
            top: `${(i * 43 + 5) % 90}%`,
            pointerEvents: "none",
          }}
          animate={{
            y: [0, -12, 0], opacity: [0.2, 0.6, 0.2],
            x: [0, (i % 2 ? 4 : -4), 0],
          }}
          transition={{ duration: 3 + (i % 4), delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #9060c0cc, transparent 95%)" }} />

      <div style={{ padding: "36px 36px 28px", position: "relative", zIndex: 1 }}>
        {/* Moon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <motion.div
            animate={rm ? {} : { filter: ["drop-shadow(0 0 8px #9060c044)", "drop-shadow(0 0 20px #9060c099)", "drop-shadow(0 0 8px #9060c044)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="22" stroke="#9060c033" strokeWidth="1" />
              <path d="M32 14a14 14 0 1 0 0 24 10 10 0 0 1 0-24z" fill="#9060c0" opacity="0.7" />
            </svg>
          </motion.div>
        </div>

        <FadeLines rm={rm} baseDelay={0.2} lines={[
          <p style={{ fontSize: 11, color: "#9060c055", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontFamily: "Sora,sans-serif" }}>
            A forgotten memory surfaces
          </p>,
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#c090f0", letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: 6, fontStyle: "italic" }}>
              {profile.worldName}
            </h2>
            <p style={{ fontSize: 14, color: "#9060c077", fontStyle: "italic" }}>{profile.eraName}</p>
          </div>,
          <p style={{ fontSize: 15, color: "rgba(192,144,240,0.65)", lineHeight: 1.85, marginBottom: 20, fontStyle: "italic" }}>
            In this world, memories are treasured, secrets endure, and shadows carry stories of their own.
            The night has lasted longer than anyone remembers.
          </p>,
          <div style={{ background: "rgba(144,96,192,0.07)", border: "1px solid #9060c022", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#9060c055", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Sora,sans-serif" }}>
              Your alternate self walks paths few dare follow
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#c090f0", fontStyle: "italic" }}>{profile.alternativeName}</p>
            <p style={{ fontSize: 14, color: "#9060c0aa", fontStyle: "italic", marginTop: 4 }}>{profile.profession}</p>
          </div>,
          <p style={{ fontSize: 14, color: "rgba(192,144,240,0.45)", fontStyle: "italic", lineHeight: 1.7, marginTop: 20 }}>
            Listen carefully. The city remembers.
          </p>,
        ]} />

        <ArrivalButtons primary="Follow the Whisper" secondary="Enter the Veil" onDismiss={onDismiss} primaryColor="#9060c0" textColor="#090510" />
      </div>
    </div>
  );
}

// ── Root modal ────────────────────────────────────────────────────────────────
const ARRIVAL_COMPONENTS: Record<UniverseType, React.ComponentType<{ profile: AlternateProfile; onDismiss: () => void; rm: boolean }>> = {
  medieval:  MedievalArrival,
  cyberpunk: CyberpunkArrival,
  pirate:    PirateArrival,
  dragon:    DragonArrival,
  galactic:  GalacticArrival,
  vampire:   VampireArrival,
};

export default function UniverseArrivalModal({ universeId, profile, onDismiss }: Props) {
  const rm = useReducedMotion() ?? false;
  const ArrivalContent = ARRIVAL_COMPONENTS[universeId];
  if (!ArrivalContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: rm ? 0.1 : 0.3 }}
        style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(2,3,6,0.92)", backdropFilter: "blur(16px)",
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
          <ArrivalContent profile={profile} onDismiss={onDismiss} rm={rm} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
