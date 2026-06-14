"use client";

import React from "react";

/* Responsive dashboard grid for the Universe Discovery page. */
export const DASH_GRID_CSS = `
  .lo-dash-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  @media (max-width: 820px) { .lo-dash-grid { grid-template-columns: 1fr; } }
`;

/* A glassy dashboard panel with right-side atmospheric imagery + accent glow. */
export function Panel({ accent, image, locked, lockHint, wide, children }: {
  accent: string; image?: string; locked?: boolean; lockHint?: string; wide?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "relative", borderRadius: 18, overflow: "hidden", minHeight: 188,
      gridColumn: wide ? "1 / -1" : undefined,
      background: "linear-gradient(160deg, rgba(17,19,30,0.8), rgba(9,11,19,0.92))",
      border: `1px solid ${accent}33`, boxShadow: `0 22px 54px -30px ${accent}66`,
      display: "flex", flexDirection: "column",
    }}>
      {/* Right-side image */}
      {image && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60%",
          backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center right" }} />
      )}
      {/* Fade so the left stays dark + readable */}
      {image && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to right, rgba(9,11,19,0.98) 28%, rgba(9,11,19,0.72) 46%, rgba(9,11,19,0.18) 66%, transparent 88%)" }} />
      )}
      {/* Accent corner glow */}
      <div style={{ position: "absolute", top: -40, left: -30, width: 150, height: 150,
        background: `radial-gradient(circle, ${accent}22, transparent 70%)`, pointerEvents: "none" }} />

      {/* Content (left) */}
      <div style={{ position: "relative", zIndex: 2, padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1,
        maxWidth: image ? "58%" : "100%", opacity: locked ? 0.5 : 1, filter: locked ? "grayscale(0.4)" : "none" }}>
        {children}
      </div>

      {locked && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(8,9,15,0.62)", backdropFilter: "blur(1px)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke={accent} strokeWidth="1.6" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={accent} strokeWidth="1.6" />
          </svg>
          <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 210, textAlign: "center", lineHeight: 1.4 }}>{lockHint}</span>
        </div>
      )}
    </div>
  );
}

export function PanelHead({ accent, kicker, title, icon, bareIcon }: {
  accent: string; kicker: string; title: string; icon: React.ReactNode; bareIcon?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
      {bareIcon ? (
        <div style={{ width: 46, height: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      ) : (
        <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: `radial-gradient(circle at 40% 35%, ${accent}26, rgba(8,10,18,0.6))`, border: `1.5px solid ${accent}66`, boxShadow: `0 0 18px ${accent}33` }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 3 }}>{kicker}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: "0.01em" }}>{title}</div>
      </div>
    </div>
  );
}

export function PanelText({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>{children}</p>;
}

export function PanelCTA({ accent, label, onClick, disabled }: {
  accent: string; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 18px", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Sora, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
        color: accent, background: `${accent}1f`, border: `1px solid ${accent}66`, transition: "all 0.2s" }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget as HTMLButtonElement; b.style.background = accent; b.style.color = "#06070f"; } }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${accent}1f`; b.style.color = accent; }}>
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

export function StabilityRing({ value }: { value: number }) {
  const r = 30, circ = 2 * Math.PI * r;
  const color = value >= 70 ? "#4ecdc4" : value >= 40 ? "#e8c97e" : "#f07070";
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="5" fill="none" />
        <circle cx="38" cy="38" r={r} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)} transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 17, fontWeight: 700, color }}>{value}%</span>
      </div>
    </div>
  );
}

/* Section heading used for the "Your Universes" carousel label. */
export function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: "#fff", margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 5 }}>{sub}</p>}
    </div>
  );
}

/* Rich header for the dashboard section. */
export function DashboardHeader() {
  return (
    <div style={{ marginBottom: 30, maxWidth: 640 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 14, width: "fit-content",
        background: "linear-gradient(90deg, #4ecdc4, #9d91ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        Your Multiverse
      </div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(24px, 3.6vw, 36px)", fontWeight: 600, color: "#fff", lineHeight: 1.28, letterSpacing: "0.03em", margin: "0 0 14px" }}>
        Everything your six selves<br />have set in motion.
      </h2>
      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, color: "rgba(255,255,255,0.62)", lineHeight: 1.7, margin: 0, maxWidth: 520, fontWeight: 300 }}>
        Explore your timelines, strengthen your balance, and become the story only you can write.
      </p>
    </div>
  );
}

export function DashboardFooter() {
  return (
    <div style={{ textAlign: "center", marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Crimson Pro', serif", fontStyle: "italic" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" fill="#e8c97e" /></svg>
      Your multiverse evolves with every choice.
    </div>
  );
}
