/**
 * Timeline Stability — the central gameplay mechanic.
 * Every major decision shifts stability, which changes how the whole multiverse behaves.
 */

export type StabilityStatus = "stable" | "unstable" | "critical" | "collapse";

export interface StabilityTier {
  min: number;
  max: number;
  status: StabilityStatus;
  label: string;
  effect: string;
  color: string;
}

// Ordered high → low
export const STABILITY_TIERS: StabilityTier[] = [
  { min: 90, max: 100, status: "stable",   label: "Stable Timeline",        effect: "Reality holds. Your selves remember clearly.",          color: "#4ecdc4" },
  { min: 60, max: 89,  status: "stable",   label: "Minor Anomalies",        effect: "Small ripples. The occasional déjà vu.",               color: "#9d91ff" },
  { min: 35, max: 59,  status: "unstable", label: "Memory Inconsistency",   effect: "Future memories blur. They misremember your past.",    color: "#e8c97e" },
  { min: 15, max: 34,  status: "critical", label: "Frequent Intercepts",    effect: "The Shadow Self hijacks the channel often.",           color: "#f0a050" },
  { min: 0,  max: 14,  status: "collapse", label: "Timeline Collapse",      effect: "The timeline is failing. Nothing is certain.",         color: "#f07070" },
];

export function getTier(stability: number): StabilityTier {
  const s = clamp(stability);
  return STABILITY_TIERS.find(t => s >= t.min && s <= t.max) || STABILITY_TIERS[STABILITY_TIERS.length - 1];
}

export function statusFromStability(stability: number): StabilityStatus {
  return getTier(stability).status;
}

export function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function applyDelta(current: number, delta: number): { stability: number; status: StabilityStatus } {
  const stability = clamp(current + delta);
  return { stability, status: statusFromStability(stability) };
}

/** 0 (no corruption) → 1 (max corruption). Kicks in below 60%. */
export function corruptionLevel(stability: number): number {
  const s = clamp(stability);
  if (s >= 60) return 0;
  return Math.min(1, (60 - s) / 60);
}

/** Probability the Shadow Self hijacks a transmission, by tier. */
export function interceptChance(stability: number): number {
  const s = clamp(stability);
  if (s >= 60) return 0;
  if (s >= 35) return 0.15;
  if (s >= 15) return 0.45;
  return 0.7;
}

/** A behavioral instruction injected into agent prompts so they react to instability. */
export function stabilityBehaviorNote(stability: number, speaker: "future" | "council"): string {
  const tier = getTier(stability);
  const who = speaker === "future" ? "You are their Future Self." : "You are one of their selves at the Council.";
  switch (tier.status) {
    case "stable":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). The timeline is steady. Speak normally — clear, grounded, sure of your memories.`;
    case "unstable":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} Your memories are starting to blur. Occasionally contradict a small detail, or pause as if a memory doesn't line up. Drop a line like "...that's strange, I don't remember it that way" once if it fits.`;
    case "critical":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} The timeline feels unsteady. Be a little unsettled. You might note that "something changed" or "this isn't how I remember it." Your certainty is wavering.`;
    case "collapse":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} The timeline is very unstable. Speak in short, slightly disjointed sentences, as if memories are blurring together. Stay hopeful and warm even amid the confusion.`;
  }
}
