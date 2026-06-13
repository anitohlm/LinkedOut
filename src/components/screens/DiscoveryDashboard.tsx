"use client";

import React from "react";

/* Responsive dashboard grid for the Universe Discovery page. */
export const DASH_GRID_CSS = `
  .lo-dash-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  @media (max-width: 760px) { .lo-dash-grid { grid-template-columns: 1fr; } }
`;

/* A glassy dashboard panel with an accent glow and optional locked overlay. */
export function Panel({ accent, locked, lockHint, children }: {
  accent: string; locked?: boolean; lockHint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "relative", borderRadius: 18, padding: "22px 24px", overflow: "hidden",
      background: "linear-gradient(160deg, rgba(17,19,30,0.74), rgba(9,11,19,0.85))", backdropFilter: "blur(12px)",
      border: `1px solid ${accent}2e`, boxShadow: `0 22px 54px -30px ${accent}66`,
      display: "flex", flexDirection: "column", minHeight: 170,
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150,
        background: `radial-gradient(circle, ${accent}22, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1,
        opacity: locked ? 0.45 : 1, filter: locked ? "grayscale(0.4)" : "none" }}>
        {children}
      </div>
      {locked && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(8,9,15,0.5)", backdropFilter: "blur(1px)" }}>
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

export function PanelHead({ accent, kicker, title, icon }: {
  accent: string; kicker: string; title: string; icon: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: `${accent}1a`, border: `1px solid ${accent}44` }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 2 }}>{kicker}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px" }}>{title}</div>
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
        color: accent, background: `${accent}18`, border: `1px solid ${accent}55`, transition: "all 0.2s" }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget as HTMLButtonElement; b.style.background = accent; b.style.color = "#06070f"; } }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${accent}18`; b.style.color = accent; }}>
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
        <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}%</span>
      </div>
    </div>
  );
}

export function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: "#fff", margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 5 }}>{sub}</p>}
    </div>
  );
}
