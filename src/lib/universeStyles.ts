import type { CSSProperties } from "react";

/**
 * Per-universe typing personality — applied to character speech bubbles in
 * FutureTransmission and CouncilOfSelves.
 *
 * Rules:
 *  - Only applied to the character's side (assistant / council), never the user.
 *  - Villain / Shadow intercept messages intentionally inherit none of this.
 *  - Font families must be loaded in layout.tsx before use.
 */
export const UNIVERSE_CHAT_STYLE: Record<string, CSSProperties> = {
  // Eternal Night — centuries-old vampire: poetic, deliberate, italic serif
  vampire: {
    fontFamily: "'Crimson Pro', serif",
    fontStyle: "italic",
    fontSize: 15.5,
    lineHeight: 1.85,
    letterSpacing: "0.015em",
  },
  // Medieval Kingdom — courtly scribe: formal serif, measured cadence
  medieval: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13.5,
    lineHeight: 1.8,
    letterSpacing: "0.04em",
    fontWeight: 400,
  },
  // Neon Synthesis — digital native: monospace, terminal aesthetic
  cyberpunk: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13.5,
    lineHeight: 1.7,
    letterSpacing: "0.02em",
  },
  // Endless Seas — seafarer: punchy bold sans, wide-open line height
  pirate: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 14.5,
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: "0em",
  },
  // Ancient Draconia — dragon sage: ornate serif, slow and weighty
  dragon: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 13,
    lineHeight: 1.95,
    letterSpacing: "0.06em",
    fontWeight: 400,
  },
  // Cosmic Frontier — scientist explorer: clean italic sans, clinical precision
  galactic: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 14,
    lineHeight: 1.65,
    letterSpacing: "0.01em",
    fontStyle: "italic",
  },
};
